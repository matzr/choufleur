(function() {
    'use strict';

    angular.module('choufleur.directives')
        .directive('mgSensorDetails', function() {

            return {
                replace: true,
                restrict: 'E',
                scope: {
                    sensorId: '=',
                    sensorName: '='
                },
                templateUrl: 'views/directives/mg-sensor-details.html',
                controller: ['$scope', '$http', 'socket', '$timeout',
                    function($scope, $http, socket, $timeout) {
                        $scope.dtFrom = moment().startOf('day').valueOf();
                        $scope.dtTo = moment().endOf('day').valueOf();
                        $scope.minSoundLevel = 100;
                        $scope.maxSoundLevel = -10;

                        function getAudioPlayer() {
                            if (!$scope.audioPlayer) {
                                $scope.audioPlayer = $('#audioPlayer' + $scope.sensorId);

                                $scope.audioPlayer.bind('ended', function() {
                                    if ($scope.autoplay) {
                                        $timeout(playNextSample);
                                    } else {
                                        $scope.currentlyPlaying = null;
                                        $scope.$apply();
                                    }
                                });

                            }
                            return $scope.audioPlayer;
                        }

                        function init() {
                            $scope.samples = [];
                            $scope.currentlyPlaying = null;
                            $scope.loading = true;
                            $http.get('/samples/' + $scope.sensorId + '/' + $scope.dtFrom + '/' + $scope.dtTo).success(function(samples) {
                                $scope.samples = samples.sort(function(a, b) {
                                    if (a.sample_start_date < b.sample_start_date) return 1;
                                    if (b.sample_start_date < a.sample_start_date) return -1;
                                    return 0;
                                });

                                $scope.minSoundLevel = parseFloat(_.min(samples, function(sample) {
                                    return parseFloat(sample.sample_average_sound_level);
                                }).sample_average_sound_level);
                                $scope.maxSoundLevel = parseFloat(_.max(samples, function(sample) {
                                    return parseFloat(sample.sample_average_sound_level);
                                }).sample_average_sound_level);
                                $scope.soundLevelAmplitude = $scope.maxSoundLevel - $scope.minSoundLevel;
                                if ($scope.soundLevelAmplitude === 0) {
                                    $scope.soundLevelAmplitude = 1;
                                }
                                $scope.loading = false;
                            });
                        }

                        socket.on('sample', function(sample) {
                            var start = moment(sample.sample_start_date).valueOf();
                            if ((sample.sensor_id === $scope.sensorId) && (start > $scope.dtFrom) && (start < $scope.dtTo)) {
                                if ($scope.samples) {
                                    $scope.samples.push(sample);
                                    $scope.samples = $scope.samples.sort(function(a, b) {
                                        if (a.sample_start_date < b.sample_start_date) return 1;
                                        if (b.sample_start_date < a.sample_start_date) return -1;
                                        return 0;
                                    });

                                    if (sample.sample_average_sound_level > $scope.maxSoundLevel) {
                                        $scope.maxSoundLevel = sample.sample_average_sound_level;
                                    }
                                    if (sample.sample_average_sound_level < $scope.minSoundLevel) {
                                        $scope.minSoundLevel = sample.sample_average_sound_level;
                                    }

                                    $scope.$apply();
                                }
                                if ($scope.autoplay && !$scope.currentlyPlaying) {
                                    $scope.playSample(sample);
                                }
                            }
                        });

                        $scope.playSample = function(sample) {
                            $scope.currentlyPlaying = sample;
                            getAudioPlayer().attr("src", '/sample/' + sample.sampleUid);
                            getAudioPlayer()[0].pause();
                            getAudioPlayer()[0].load();
                            getAudioPlayer()[0].play();
                        }

                        function playNextSample() {
                            if ($scope.samples.indexOf($scope.currentlyPlaying) > 0) {
                                $scope.playSample($scope.samples[$scope.samples.indexOf($scope.currentlyPlaying) - 1]);
                            } else {
                                $scope.currentlyPlaying = null;
                                $scope.$apply();
                            }
                        }

                        $scope.getSampleStartDate = function(sample) {
                            return moment(sample.sample_start_date).valueOf();
                        }

                        $scope.getSampleDuration = function(sample) {
                            return sample.sample_duration;
                        }

                        $scope.getCssPosition = function(sample) {
                            if (sample) {
                                sample.sample_average_sound_level = parseFloat(sample.sample_average_sound_level);
                                var red = parseInt((sample.sample_average_sound_level - $scope.minSoundLevel) / $scope.soundLevelAmplitude * 255, 10);
                                var green = 255 - parseInt((sample.sample_average_sound_level - $scope.minSoundLevel) / $scope.soundLevelAmplitude * 255, 10);
                                var color = 'rgba(' + red + ', ' + green + ', 0, .7' + ');';
                                return 'background-color: ' + color;
                            }
                        }

                        $scope.goToPreviousDay = function() {
                            $scope.dtFrom = moment($scope.dtFrom).add('days', -1).startOf('day').valueOf();
                            $scope.dtTo = moment($scope.dtFrom).endOf('day').valueOf();
                            init();
                        }

                        $scope.goToNextDay = function() {
                            $scope.dtFrom = moment($scope.dtFrom).add('days', 1).startOf('day').valueOf();
                            $scope.dtTo = moment($scope.dtFrom).endOf('day').valueOf();
                            init();
                        }

                        $scope.unzoomFullDay = function() {
                            $scope.dtFrom = moment($scope.dtFrom).startOf('day').valueOf();
                            $scope.dtTo = moment($scope.dtTo).endOf('day').valueOf();
                        }

                        $scope.$watch('dtFrom', init);
                        $scope.$watch('dtTo', init);

                        $scope.isFullDay = function() {
                            return $scope.dtTo - $scope.dtFrom > (oneDayInMs - 2);
                        }

                        var now = _.now();

                        var oneDayInMs = 24 * 60 * 60 * 1000;
                        var timelineDuration = oneDayInMs;

                        init();
                    }
                ]
            };
        });
})();

//mg-sensor-details.html
