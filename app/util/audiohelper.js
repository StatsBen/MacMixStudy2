

var AudioContextSingleton = (function () {
    var audioContextSingleton;
 
    function createInstance() {
        var newAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        return newAudioContext;
    }
 
    return {
        getInstance: function () {
            console.log('Instance requested.');
            if (!audioContextSingleton) {
                console.log('Creating singleton...');
                audioContextSingleton = createInstance();
                console.log('...done.');
            }
            return audioContextSingleton;
        }
    };
})();



module.exports = {
    AudioContextSingleton: AudioContextSingleton
};