var rtmp = "rtmp://broadcast.api.video/s/82e5da80-e6fd-4f3c-9d6d-80349a42c10c";
require('dotenv').config();
//import express from 'express';
const express = require('express');
//express for the website and pug to create the pages
const app = express();
app.use(express.static('public'));



//ffmpeg
var spawn = require('child_process').spawn;
spawn('ffmpeg',['-h']).on('error',function(m){
	console.error("FFMpeg not found in system cli; please install ffmpeg properly or make a softlink to ./!");
	process.exit(-1);
});
var ffmpeg_process, feedStream=false;


//media server
const NodeMediaServer = require('node-media-server');
 
const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    allow_origin: '*'
  }
};
 
var nms = new NodeMediaServer(config)
nms.run();




app.get ('/start', (req,res) => {
		//oj this will kick the video stream off
		console.log(req.body);
		
		var rtmpDestination = rtmp;
		
		var ops = ['-re',
			'-f', 'concat', '-safe', 0,'-protocol_whitelist', 'file,https,tls,tcp','-i', 'src/hanukkah_playlist.txt' ,
			  '-c', 'copy', '-bufsize', '3500k',
				'-f', 'flv', rtmpDestination		
		];


		console.log("ops", ops);
		ffmpeg_process=spawn('ffmpeg', ops);
		//ffmpeg started
		console.log("video stream started");
		
		ffmpeg_process.stderr.on('data',function(d){
			console.log('ffmpeg_stderr',''+d);
		});
		
		//
		 res.sendStatus(200);
});



//testing on 3030
app.listen(process.env.PORT || 3030, () =>
  console.log('Example app listening on port 3030!'),
);
process.on('uncaughtException', function(err) {
    // handle the error safely
    console.log(err)
    // Note: after client disconnect, the subprocess will cause an Error EPIPE, which can only be caught this way.
});

