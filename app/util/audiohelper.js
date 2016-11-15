

var AudioContextSingleton = (function () {
    var audioContextSingleton;
 
    function createInstance() {
        var newAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        return newAudioContext;
    }
 
    return {
        getInstance: function () {
            if (!audioContextSingleton) {
                audioContextSingleton = createInstance();
            }
            return audioContextSingleton;
        }
    };
})();



module.exports = {
    AudioContextSingleton: AudioContextSingleton
};