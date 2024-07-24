var express = require('express');
var router = express.Router();

var connection = require('../config/database');

router.get('/',function(req, res, next){
    connection.query('select * from jenis order by id_jenis desc', function(err, rows){
        if(err){
            req.flash('error',err);
        }
        else{
            res.render('jenis/index',{
               data:rows 
            });
        }
    });
});
router.get('/create',function(req, res, next){
    res.render('jenis/create',{
        nama_jenis: ''
    })
});
router.post('/store', function(req, res, next){
    try{
        let {nama_jenis} = req.body;
        let data = {
            nama_jenis
        }
        connection.query('insert into jenis set ?', data, function(err,result){
            if(err){
                req.flash('error','Gagal menyimpan data');
            }
            else{
                req.flash('success','Berhasil menyimpan data');
            }
            res.redirect('/jenis');
        })
    }
    catch{
        req.flash('error', 'Terjadi kesalahan pada fungsi');
        res.redirect('/jenis');
    }
})
router.get('/edit/(:id)', function(req, res, next){
    let id = req.params.id;
    connection.query('select * from jenis where id_jenis = ' + id, function(err, rows){
        if(err){
            req.flash('error, Query gagal!');
        }
        else{
            res.render('jenis/edit',{
                id_jenis:     rows[0].id_jenis,
                nama_jenis:   rows[0].nama_jenis
            })
        }
    })
})
router.post('/update/(:id)', function(req, res, next){
    try{
        let id = req.params.id;
        let {nama_jenis} = req.body;
        let data = {
            nama_jenis: nama_jenis
        }
        connection.query('update jenis set ? where id_jenis = ' + id, data, function(err){
            if(err){
                req.flash('error','Gagal memperbarui data!');
            }
            else{
                req.flash('success','Berhasil memperbarui data!');
            }
            res.redirect('/jenis');
        })
    }
    catch{
        req.flash('error','Kesalahan pada fungsi');
        res.render('/jenis');
    }
})
router.get('/delete/(:id)', function(req, res){
    let id = req.params.id;
    connection.query('delete from jenis where id_jenis = ' + id, function(err){
        if(err){
            req.flash('error','Tidak bisa menghapus data!');
        }
        else{
            req.flash('success','Data berhasil dihapus!');
        }
        res.redirect('/jenis');
    })
})
module.exports = router;