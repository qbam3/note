var express = require('express');
var router = express.Router();
var connection = require('../config/database');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/images')); // Perbaiki path
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.get('/', function(req, res, next) {
    connection.query(
        'SELECT * FROM catatan a LEFT JOIN jenis b ON b.id_jenis = a.jenis_catatan ORDER BY a.id_catatan DESC',
        function(err, rows) {
            if (err) {
                req.flash('error', err);
                res.render('catatan', { data: '' });
            } else {
                res.render('catatan/index', { data: rows });
            }
        }
    );
});

router.get('/create', function(req, res, next) {
    connection.query('SELECT * FROM jenis ORDER BY id_jenis DESC', function(err, rows) {
        if (err) {
            req.flash('error', 'Gagal membuat data!');
            res.render('catatan/create', { data: [] });
        } else {
            res.render('catatan/create', { data: rows });
        }
    });
});

router.post('/store', upload.single("foto_catatan"), (req, res, next) => {
    try {
        let { id_jenis, nama_catatan, keterangan_catatan } = req.body;

        let data = {
            jenis_catatan: id_jenis,
            nama_catatan: nama_catatan,
            keterangan_catatan: keterangan_catatan
        };

        if (req.file) {
            data.foto_catatan = req.file.filename;
        }

        connection.query('INSERT INTO catatan SET ?', data, function(err, result) {
            if (err) {
                req.flash('error', 'Gagal menyimpan data ke database!');
                res.redirect('/catatan/create');
            } else {
                req.flash('success', 'Berhasil menyimpan data!');
                res.redirect('/catatan');
            }
        });
    } catch (err) {
        req.flash('error', 'Terjadi kesalahan pada fungsi!');
        res.redirect('/catatan/create');
    }
});

router.get('/edit/:id', function(req, res, next) {
    let id = req.params.id;

    connection.query('SELECT * FROM jenis ORDER BY id_jenis DESC', function(err, jenis) {
        if (err) {
            req.flash('error', 'Gagal mengambil data jenis!');
            res.redirect('/catatan');
        } else {
            connection.query('SELECT * FROM catatan a LEFT JOIN jenis b ON b.id_jenis = a.jenis_catatan WHERE a.id_catatan = ?', [id], function(err, rows) {
                if (err) {
                    req.flash('error', 'Gagal mengambil data catatan!');
                    res.redirect('/catatan');
                } else {
                    res.render('catatan/edit', {
                        id_catatan: rows[0].id_catatan,
                        nama_catatan: rows[0].nama_catatan,
                        keterangan_catatan: rows[0].keterangan_catatan,
                        foto_catatan: rows[0].foto_catatan,
                        jenis_catatan: rows[0].jenis_catatan,
                        data: jenis
                    });
                }
            });
        }
    });
});


router.post('/update/(:id)', upload.single("foto_catatan"), function(req, res, next) {
    try {
        let id = req.params.id;
        let { nama_catatan, keterangan_catatan, id_jenis } = req.body;
        let gambar = req.file ? req.file.filename : null;

        connection.query('SELECT * FROM catatan WHERE id_catatan = ?', [id], function(err, rows) {
            if (err) {
                req.flash('error', 'Gagal mengambil data dari database!');
                res.redirect('/catatan');
                return;
            }

            const filelama = rows[0].foto_catatan;
            if (gambar && filelama) {
                const pathFile = path.join(__dirname, '../public/images/', filelama);
                try {
                    fs.unlinkSync(pathFile);
                } catch (unlinkErr) {
                    console.error('Gagal menghapus file:', unlinkErr);
                }
            }

            let foto_catatan = gambar || filelama;
            let updateData = {
                nama_catatan: nama_catatan,
                keterangan_catatan: keterangan_catatan,
                foto_catatan: foto_catatan,
                jenis_catatan: id_jenis
            };

            connection.query('UPDATE catatan SET ? WHERE id_catatan = ?', [updateData, id], function(err, result) {
                if (err) {
                    req.flash('error', 'Gagal memperbarui data!');
                    console.error('Update error:', err);
                } else {
                    req.flash('success', 'Data berhasil diperbarui!');
                }
                res.redirect('/catatan');
            });
        });
    } catch (err) {
        req.flash('error', 'Terjadi kesalahan pada fungsi!');
        console.error('Catch error:', err);
        res.redirect('/catatan');
    }
});


router.get('/delete/(:id)', function(req, res, next) {
    let id = req.params.id;
    connection.query('SELECT * FROM catatan WHERE id_catatan = ?', [id], function(err, rows) {
        const filelama = rows[0].foto_catatan;
        if (filelama) {
            const pathFile = path.join(__dirname, '../public/images/', filelama);
            fs.unlinkSync(pathFile);
        }
        connection.query('DELETE FROM catatan WHERE id_catatan = ?', [id], function(err, result) {
            if (err) {
                req.flash('error', 'Gagal menghapus data!');
            } else {
                req.flash('success', 'Data terhapus!');
            }
            res.redirect('/catatan');
        });
    });
});

module.exports = router;
