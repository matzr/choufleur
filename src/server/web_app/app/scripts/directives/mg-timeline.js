(function() {
    'use strict';

    angular.module('choufleur.directives')
        .directive('mgTimeline', function() {

            return {
                replace: true,
                restrict: 'E',
                templateUrl: 'views/directives/mg-timeline.html',
                scope: {
                    events: '=',
                    minValue: '=',
                    maxValue: '=',
                    selectedEvent: '=',
                    getEventTime: '&',
                    getEventDuration: '&',
                    getCss: '&',
                    onClick: '&'
                },
                controller: ['$scope',
                    function($scope) {
                        $scope.getCssHandler = function(event) {

                            var percentageOfTimeline = ($scope.getEventTime()(event) - $scope.minValue) / $scope.valueSpread * 100;
                            var style = 'left: ' + percentageOfTimeline + '%; ';
                            percentageOfTimeline = ($scope.getEventDuration()(event) * 1000) / $scope.valueSpread * 100;
                            var widthInPix = $scope.$timeline.width() * percentageOfTimeline / 100;
                            style += 'width: ' + ((widthInPix < 1)?'1px;':(percentageOfTimeline + '%;'));
                            if ($scope.getCss) {
                                style += $scope.getCss()(event);
                            }
                            return style;
                        }

                        $scope.calculateSpread = function() {
                            $scope.valueSpread = $scope.maxValue - $scope.minValue;
                        }

                        $scope.$watch('minValue', $scope.calculateSpread);
                        $scope.$watch('maxValue', $scope.calculateSpread);
                    }
                ],
                link: function($scope, element, attrs) {
                    console.log('linked');

                    var $timeline = $(element);
                    $scope.$timeline = $timeline;
                    var startValue;
                    var endValue;
                    var dragging;
                    $scope.windowLeft = 0;
                    $scope.windowRight = 0;

                    function positionToValue(position) {
                        return parseInt($scope.minValue + $scope.valueSpread * position / $timeline.width(), 10);
                    }

                    function valueToPosition(value) {
                        return (value - $scope.minValue) / $scope.valueSpread * $timeline.width();
                    }

                    $timeline.on('mousedown', function(evt) {
                        $scope.dragging = true;
                        endValue = startValue = positionToValue(evt.offsetX);
                        $scope.windowLeft = evt.offsetX;
                    });

                    $(document).on('mouseup', function(evt) {
                        if ($scope.dragging) {
                            $scope.dragging = false;
                            if (endValue === startValue) {
                                var closestEvent = _.min($scope.events, function(event) {
                                    return Math.abs($scope.getEventTime()(event) - endValue);
                                });
                                if (closestEvent) {
                                    $scope.onClick()(closestEvent);
                                    $scope.$apply();
                                }
                            } else {
                                if (endValue > startValue) {
                                    $scope.minValue = startValue;
                                    $scope.maxValue = endValue;
                                    $scope.calculateSpread();
                                }
                                $scope.$apply();
                            }
                        }
                    });

                    $timeline.on('mousemove', function(evt) {
                        if ($scope.dragging) {
                            endValue = positionToValue(evt.offsetX);
                            if (endValue < $scope.minValue) {
                                endValue = $scope.minValue;
                            } else if (endValue > $scope.maxValue) {
                                endValue = $scope.maxValue;
                            }
                            $scope.windowRight = evt.offsetX;
                            // if ($scope.windowLeft > $scope.windowRight) {
                            //   var left = $scope.windowRight;
                            //   $scope.windowRight = valueToPosition(startValue);
                            //   $scope.windowLeft = left;
                            // }
                            $scope.$apply();
                        }
                    });

                }
            };
        });
})();
