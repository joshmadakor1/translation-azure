
  var audio_context;
  var recorder;

  function startUserMedia(stream) {
    var input = audio_context.createMediaStreamSource(stream);
    
    recorder = new Recorder(input);
  }
  function startRecording(button) {
    recorder && recorder.record();

    button.disabled = true;
    button.nextElementSibling.disabled = false;
  }
  function startRecording2(button) {
    recorder && recorder.record();
    button.disabled = true;
    button.nextElementSibling.disabled = false;
  }
  function stopRecording(button) {
    recorder && recorder.stop();
    button.disabled = true;
    button.previousElementSibling.disabled = false;
    
    // create WAV download link using audio data blob
    createDownloadLink();
    
    recorder.clear();
  }
  function stopRecording2(button) {
    recorder && recorder.stop();
    button.disabled = true;
    button.previousElementSibling.disabled = false;
    
    // create WAV download link using audio data blob
    createDownloadLink2();
    
    recorder.clear();
  }
  function createDownloadLink() {
    
    recorder && recorder.exportWAV(function(blob) {
      var url = URL.createObjectURL(blob);
      var li = document.createElement('li');
      var au = document.createElement('audio');
      var hf = document.createElement('a');
      au.controls = true;
      au.src = url;
      hf.id = "audiolink1";
        hf.href = url;
        var filename1 = new Date().toISOString();
        filename1 = filename1.replace(/:/g, ".");
        console.log(filename1);
        hf.download = filename1 + '.wav';
      hf.innerHTML = hf.download;
      li.appendChild(au);
      li.appendChild(hf);
      //recordingslist.appendChild(li);
      recordingslist.innerHTML = li.innerHTML;

      let filename = hf.download;
      let fd = new FormData();
      fd.append('upl', blob, filename);
      $.ajax({
        type: 'POST',
        url: '/uploadAudio',
        data: fd,
        processData: false,
        contentType: false
      }).done(function(data) {
          console.log(data);
      });
    });
  }

  function createDownloadLink2() {
    recorder && recorder.exportWAV(function(blob) {
      var url = URL.createObjectURL(blob);
      var li = document.createElement('li');
      var au = document.createElement('audio');
      var hf = document.createElement('a');
      
      au.controls = true;
      au.src = url;
      hf.id = "audiolink2";
        hf.href = url;
        var filename1 = new Date().toISOString();
        filename1 = filename1.replace(/:/g, ".");
        console.log(filename1);
        hf.download = filename1 + '.wav';
      hf.innerHTML = hf.download;
      li.appendChild(au);
      li.appendChild(hf);
      //recordingslist.appendChild(li);
      recordingslist2.innerHTML = li.innerHTML;
      
      let filename = hf.download;
      let fd = new FormData();
      fd.append('upl', blob, filename);
      $.ajax({
        type: 'POST',
        url: '/uploadAudio',
        data: fd,
        processData: false,
        contentType: false
      }).done(function(data) {
          console.log(data);
      });
    });
  }
  window.onload = function init() {
    try {
      // webkit shim
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
      window.URL = window.URL || window.webkitURL;
      
      audio_context = new AudioContext;
    } catch (e) {
      //alert('No web audio support in this browser!');
    }
    navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
    });
  };

