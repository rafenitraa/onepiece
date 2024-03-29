!function () {
    "use strict";
    angular.module("ui.sortable", []).constant("sortableConfig", {
        itemClass: "as-sortable-item",
        handleClass: "as-sortable-item-handle",
        placeHolderClass: "as-sortable-placeholder",
        dragClass: "as-sortable-drag",
        hiddenClass: "as-sortable-hidden",
        dragging: "as-sortable-dragging"
    })
}(), function () {
    "use strict";
    var mainModule = angular.module("ui.sortable");
    mainModule.factory("$helper", ["$document", "$window", function ($document, $window) {
        return {
            height: function (element) {
                return element[0].getBoundingClientRect().height
            }, width: function (element) {
                return element[0].getBoundingClientRect().width
            }, offset: function (element, scrollableContainer) {
                var boundingClientRect = element[0].getBoundingClientRect();

                return scrollableContainer || (scrollableContainer = $document[0].documentElement), {
                    width: boundingClientRect.width || element.prop("offsetWidth"),
                    height: boundingClientRect.height || element.prop("offsetHeight"),
                    top: boundingClientRect.top + ($window.pageYOffset || scrollableContainer.scrollTop - $(".settings").offset().top) , //uggly fix
                    left: boundingClientRect.left + ($window.pageXOffset || scrollableContainer.scrollLeft - $(".settings").offset().left)
                }
            }, eventObj: function (event) {
                var obj = event;
                return void 0 !== event.targetTouches ? obj = event.targetTouches.item(0) : void 0 !== event.originalEvent && void 0 !== event.originalEvent.targetTouches && (obj = event.originalEvent.targetTouches.item(0)), obj
            }, isTouchInvalid: function (event) {
                var touchInvalid = !1;
                return void 0 !== event.touches && event.touches.length > 1 ? touchInvalid = !0 : void 0 !== event.originalEvent && void 0 !== event.originalEvent.touches && event.originalEvent.touches.length > 1 && (touchInvalid = !0), touchInvalid
            }, positionStarted: function (event, target, scrollableContainer) {
                var pos = {};
                return pos.offsetX = event.pageX - this.offset(target, scrollableContainer).left, pos.offsetY = event.pageY - this.offset(target, scrollableContainer).top, pos.startX = pos.lastX = event.pageX, pos.startY = pos.lastY = event.pageY, pos.nowX = pos.nowY = pos.distX = pos.distY = pos.dirAx = 0, pos.dirX = pos.dirY = pos.lastDirX = pos.lastDirY = pos.distAxX = pos.distAxY = 0, pos
            }, calculatePosition: function (pos, event) {
                pos.lastX = pos.nowX, pos.lastY = pos.nowY, pos.nowX = event.pageX, pos.nowY = event.pageY, pos.distX = pos.nowX - pos.lastX, pos.distY = pos.nowY - pos.lastY, pos.lastDirX = pos.dirX, pos.lastDirY = pos.dirY, pos.dirX = 0 === pos.distX ? 0 : pos.distX > 0 ? 1 : -1, pos.dirY = 0 === pos.distY ? 0 : pos.distY > 0 ? 1 : -1;
                var newAx = Math.abs(pos.distX) > Math.abs(pos.distY) ? 1 : 0;
                pos.dirAx !== newAx ? (pos.distAxX = 0, pos.distAxY = 0) : (pos.distAxX += Math.abs(pos.distX), 0 !== pos.dirX && pos.dirX !== pos.lastDirX && (pos.distAxX = 0), pos.distAxY += Math.abs(pos.distY), 0 !== pos.dirY && pos.dirY !== pos.lastDirY && (pos.distAxY = 0)), pos.dirAx = newAx
            }, movePosition: function (event, element, pos, container, containerPositioning, scrollableContainer) {
                var bounds, useRelative = "relative" === containerPositioning;
                element.x = event.pageX - pos.offsetX, element.y = event.pageY - pos.offsetY, container && (bounds = this.offset(container, scrollableContainer), useRelative && (element.x -= bounds.left, element.y -= bounds.top, bounds.left = 10, bounds.top = 10), element.x < bounds.left ? element.x = bounds.left : element.x >= bounds.width + bounds.left - this.offset(element).width && (element.x = bounds.width + bounds.left - this.offset(element).width), element.y < bounds.top ? element.y = bounds.top : element.y >= bounds.height + bounds.top - this.offset(element).height && (element.y = bounds.height + bounds.top - this.offset(element).height)), element.css({
                    left: element.x + "px",
                    top: element.y + "px"
                }), this.calculatePosition(pos, event)
            }, dragItem: function (item) {
                return {
                    index: item.index(),
                    parent: item.sortableScope,
                    source: item,
                    sourceInfo: {index: item.index(), itemScope: item.itemScope, sortableScope: item.sortableScope},
                    moveTo: function (parent, index) {
                        this.parent = parent, this.isSameParent() && this.source.index() < index && (index -= 1), this.index = index
                    },
                    isSameParent: function () {
                        return this.parent.element === this.sourceInfo.sortableScope.element
                    },
                    isOrderChanged: function () {
                        return this.index !== this.sourceInfo.index
                    },
                    eventArgs: function () {
                        return {source: this.sourceInfo, dest: {index: this.index, sortableScope: this.parent}}
                    },
                    apply: function () {
                        this.sourceInfo.sortableScope.removeItem(this.sourceInfo.index), this.parent.insertItem(this.index, this.source.modelValue)
                    }
                }
            }, noDrag: function (element) {
                return void 0 !== element.attr("no-drag") || void 0 !== element.attr("data-no-drag")
            }
        }
    }])
}(), function () {
    "use strict";
    var mainModule = angular.module("ui.sortable");
    mainModule.controller("ui.sortable.sortableController", ["$scope", function ($scope) {
        this.scope = $scope, $scope.modelValue = null, $scope.callbacks = null, $scope.type = "sortable", $scope.options = {}, $scope.isDisabled = !1, $scope.insertItem = function (index, itemData) {
            $scope.modelValue.splice(index, 0, itemData)
        }, $scope.removeItem = function (index) {
            var removedItem = null;
            return index > -1 && (removedItem = $scope.modelValue.splice(index, 1)[0]), removedItem
        }, $scope.isEmpty = function () {
            return $scope.modelValue && 0 === $scope.modelValue.length
        }, $scope.accept = function (sourceItemHandleScope, destScope, destItemScope) {
            return $scope.callbacks.accept(sourceItemHandleScope, destScope, destItemScope)
        }
    }]), mainModule.directive("asSortable", function () {
        return {
            require: "ngModel",
            restrict: "A",
            scope: !0,
            controller: "ui.sortable.sortableController",
            link: function (scope, element, attrs, ngModelController) {
                var ngModel, callbacks;
                ngModel = ngModelController, ngModel && (ngModel.$render = function () {
                    ngModel.$modelValue && angular.isArray(ngModel.$modelValue) || ngModel.$setViewValue([]), scope.modelValue = ngModel.$modelValue
                }, scope.element = element, callbacks = {
                    accept: null,
                    orderChanged: null,
                    itemMoved: null,
                    dragStart: null,
                    dragMove: null,
                    dragCancel: null,
                    dragEnd: null
                }, callbacks.accept = function () {
                    return !0
                }, callbacks.orderChanged = function () {
                }, callbacks.itemMoved = function () {
                }, callbacks.dragStart = function () {
                }, callbacks.dragMove = function () {
                }, callbacks.dragCancel = function () {
                }, callbacks.dragEnd = function () {
                }, scope.$watch(attrs.asSortable, function (newVal) {
                    angular.forEach(newVal, function (value, key) {
                        callbacks[key] ? "function" == typeof value && (callbacks[key] = value) : scope.options[key] = value
                    }), scope.callbacks = callbacks
                }, !0), angular.isDefined(attrs.isDisabled) && scope.$watch(attrs.isDisabled, function (newVal) {
                    angular.isUndefined(newVal) || (scope.isDisabled = newVal)
                }, !0))
            }
        }
    })
}(), function () {
    "use strict";
    var mainModule = angular.module("ui.sortable");
    mainModule.controller("ui.sortable.sortableItemHandleController", ["$scope", function ($scope) {
        this.scope = $scope, $scope.itemScope = null, $scope.type = "handle"
    }]), mainModule.directive("asSortableItemHandle", ["sortableConfig", "$helper", "$window", "$document", function (sortableConfig, $helper, $window, $document) {
        return {
            require: "^asSortableItem",
            scope: !0,
            restrict: "A",
            controller: "ui.sortable.sortableItemHandleController",
            link: function (scope, element, attrs, itemController) {
                function insertBefore(targetElement, targetScope) {
                    targetElement[0].parentNode.insertBefore(placeHolder[0], targetElement[0]), dragItemInfo.moveTo(targetScope.sortableScope, targetScope.index())
                }

                function insertAfter(targetElement, targetScope) {
                    targetElement.after(placeHolder), dragItemInfo.moveTo(targetScope.sortableScope, targetScope.index() + 1)
                }

                function rollbackDragChanges() {
                    placeElement.replaceWith(scope.itemScope.element), placeHolder.remove(), dragElement.remove(), dragElement = null, dragHandled = !1, containment.css("cursor", ""), containment.removeClass("as-sortable-un-selectable")
                }

                var dragElement, placeHolder, placeElement, itemPosition, dragItemInfo, containment, containerPositioning, dragListen, scrollableContainer, dragStart, dragMove, dragEnd, dragCancel, isDraggable, isDragBefore, isPlaceHolderPresent, bindDrag, unbindDrag, bindEvents, unBindEvents, hasTouch, dragHandled, isDisabled = !1;
                hasTouch = $window.hasOwnProperty("ontouchstart"), sortableConfig.handleClass && element.addClass(sortableConfig.handleClass), scope.itemScope = itemController.scope, scope.$watch("sortableScope.isDisabled", function (newVal) {
                    isDisabled !== newVal && (isDisabled = newVal, isDisabled ? unbindDrag() : bindDrag())
                }), dragListen = function (event) {
                    var startPosition, unbindMoveListen = function () {
                        angular.element($document).unbind("mousemove", moveListen), angular.element($document).unbind("touchmove", moveListen), element.unbind("mouseup", unbindMoveListen), element.unbind("touchend", unbindMoveListen), element.unbind("touchcancel", unbindMoveListen)
                    }, moveListen = function (e) {
                        e.preventDefault();
                        var eventObj = $helper.eventObj(e);
                        startPosition || (startPosition = {
                            clientX: eventObj.clientX,
                            clientY: eventObj.clientY
                        }), Math.abs(eventObj.clientX - startPosition.clientX) + Math.abs(eventObj.clientY - startPosition.clientY) > 10 && (unbindMoveListen(), dragStart(event))
                    };
                    angular.element($document).bind("mousemove", moveListen), angular.element($document).bind("touchmove", moveListen), element.bind("mouseup", unbindMoveListen), element.bind("touchend", unbindMoveListen), element.bind("touchcancel", unbindMoveListen)
                }, dragStart = function (event) {
                    var eventObj, tagName;
                    (hasTouch || 2 !== event.button && 3 !== event.which) && (hasTouch && $helper.isTouchInvalid(event) || !dragHandled && isDraggable(event) && (dragHandled = !0, event.preventDefault(), eventObj = $helper.eventObj(event), scrollableContainer = angular.element($document[0].querySelector(scope.sortableScope.options.scrollableContainer)).length > 0 ? $document[0].querySelector(scope.sortableScope.options.scrollableContainer) : $document[0].documentElement, containment = angular.element(angular.element($document[0].querySelector(scope.sortableScope.options.containment)).length > 0 ? $document[0].querySelector(scope.sortableScope.options.containment) : $document[0].body), containment.css("cursor", "move"), containment.addClass("as-sortable-un-selectable"), containerPositioning = scope.sortableScope.options.containerPositioning || "absolute", dragItemInfo = $helper.dragItem(scope), tagName = scope.itemScope.element.prop("tagName"), dragElement = angular.element($document[0].createElement(scope.sortableScope.element.prop("tagName"))).addClass(scope.sortableScope.element.attr("class")).addClass(sortableConfig.dragClass), dragElement.css("width", $helper.width(scope.itemScope.element) + "px"), dragElement.css("height", $helper.height(scope.itemScope.element) + "px"), placeHolder = angular.element($document[0].createElement(tagName)).addClass(sortableConfig.placeHolderClass).addClass(scope.sortableScope.options.additionalPlaceholderClass), placeHolder.css("width", $helper.width(scope.itemScope.element) + "px"), placeHolder.css("height", $helper.height(scope.itemScope.element) + "px"), placeElement = angular.element($document[0].createElement(tagName)), sortableConfig.hiddenClass && placeElement.addClass(sortableConfig.hiddenClass), itemPosition = $helper.positionStarted(eventObj, scope.itemScope.element, scrollableContainer), scope.itemScope.element.after(placeHolder), scope.itemScope.element.after(placeElement), dragElement.append(scope.itemScope.element), containment.append(dragElement), $helper.movePosition(eventObj, dragElement, itemPosition, containment, containerPositioning, scrollableContainer), scope.sortableScope.$apply(function () {
                        scope.callbacks.dragStart(dragItemInfo.eventArgs())
                    }), bindEvents()))
                }, isDraggable = function (event) {
                    var elementClicked, sourceScope, isDraggable;
                    for (elementClicked = angular.element(event.target), sourceScope = elementClicked.scope(), isDraggable = !1; !isDraggable && void 0 !== sourceScope;)sourceScope.type && "handle" === sourceScope.type ? isDraggable = !0 : sourceScope = sourceScope.$parent;
                    for (; isDraggable && elementClicked[0] !== element[0];)$helper.noDrag(elementClicked) && (isDraggable = !1), elementClicked = elementClicked.parent();
                    return isDraggable
                }, dragMove = function (event) {
                    var eventObj, targetX, targetY, targetScope, targetElement;
                    if ((!hasTouch || !$helper.isTouchInvalid(event)) && dragHandled && dragElement) {
                        if (event.preventDefault(), eventObj = $helper.eventObj(event), scope.sortableScope.$apply(function () {
                                scope.callbacks.dragMove(itemPosition, containment)
                            }), $helper.movePosition(eventObj, dragElement, itemPosition, containment, containerPositioning, scrollableContainer), targetX = eventObj.pageX - $document[0].documentElement.scrollLeft, targetY = eventObj.pageY - ($window.pageYOffset || $document[0].documentElement.scrollTop), dragElement.addClass(sortableConfig.hiddenClass), $document[0].elementFromPoint(targetX, targetY), targetElement = angular.element($document[0].elementFromPoint(targetX, targetY)), dragElement.removeClass(sortableConfig.hiddenClass), dragElement.addClass(sortableConfig.dragging), targetScope = targetElement.scope(), !targetScope || !targetScope.type)return;
                        if ("handle" === targetScope.type && (targetScope = targetScope.itemScope), "item" !== targetScope.type && "sortable" !== targetScope.type)return;
                        "item" === targetScope.type && (targetElement = targetScope.element, targetScope.sortableScope.accept(scope, targetScope.sortableScope, targetScope) && (itemPosition.dirAx && scope.itemScope.sortableScope.$id === targetScope.sortableScope.$id ? (itemPosition.distAxX = 0, itemPosition.distX < 0 ? insertBefore(targetElement, targetScope) : itemPosition.distX > 0 && insertAfter(targetElement, targetScope)) : isDragBefore(eventObj, targetElement) ? insertBefore(targetElement, targetScope) : insertAfter(targetElement, targetScope))), "sortable" === targetScope.type && targetScope.accept(scope, targetScope) && targetElement[0].parentNode !== targetScope.element[0] && (isPlaceHolderPresent(targetElement) || (targetElement[0].appendChild(placeHolder[0]), dragItemInfo.moveTo(targetScope, targetScope.modelValue.length)))
                    }
                }, isPlaceHolderPresent = function (targetElement) {
                    var itemElements, hasPlaceHolder, i;
                    for (itemElements = targetElement.children(), i = 0; i < itemElements.length; i += 1)if (angular.element(itemElements[i]).hasClass(sortableConfig.placeHolderClass)) {
                        hasPlaceHolder = !0;
                        break
                    }
                    return hasPlaceHolder
                }, isDragBefore = function (eventObj, targetElement) {
                    var dragBefore, targetOffset;
                    return dragBefore = !1, targetOffset = $helper.offset(targetElement), dragBefore = $helper.offset(placeHolder).top > targetOffset.top ? $helper.offset(dragElement).top < targetOffset.top + $helper.height(targetElement) / 2 : eventObj.pageY < targetOffset.top
                }, dragEnd = function (event) {
                    dragHandled && (event.preventDefault(), dragElement && (rollbackDragChanges(), dragItemInfo.apply(), scope.sortableScope.$apply(function () {
                        dragItemInfo.isSameParent() ? dragItemInfo.isOrderChanged() && scope.callbacks.orderChanged(dragItemInfo.eventArgs()) : scope.callbacks.itemMoved(dragItemInfo.eventArgs())
                    }), scope.sortableScope.$apply(function () {
                        scope.callbacks.dragEnd(dragItemInfo.eventArgs())
                    }), dragItemInfo = null), unBindEvents())
                }, dragCancel = function (event) {
                    dragHandled && (event.preventDefault(), dragElement && (rollbackDragChanges(), scope.sortableScope.$apply(function () {
                        scope.callbacks.dragCancel(dragItemInfo.eventArgs())
                    }), dragItemInfo = null), unBindEvents())
                }, bindDrag = function () {
                    element.bind("touchstart", dragListen), element.bind("mousedown", dragListen)
                }, unbindDrag = function () {
                    element.unbind("touchstart", dragListen), element.unbind("mousedown", dragListen)
                }, bindDrag(), angular.element($document[0].body).bind("keydown", function (event) {
                    27 === event.keyCode && dragCancel(event)
                }), bindEvents = function () {
                    angular.element($document).bind("touchmove", dragMove), angular.element($document).bind("touchend", dragEnd), angular.element($document).bind("touchcancel", dragCancel), angular.element($document).bind("mousemove", dragMove), angular.element($document).bind("mouseup", dragEnd)
                }, unBindEvents = function () {
                    angular.element($document).unbind("touchend", dragEnd), angular.element($document).unbind("touchcancel", dragCancel), angular.element($document).unbind("touchmove", dragMove), angular.element($document).unbind("mouseup", dragEnd), angular.element($document).unbind("mousemove", dragMove)
                }
            }
        }
    }])
}(), function () {
    "use strict";
    var mainModule = angular.module("ui.sortable");
    mainModule.controller("ui.sortable.sortableItemController", ["$scope", function ($scope) {
        this.scope = $scope, $scope.sortableScope = null, $scope.modelValue = null, $scope.type = "item", $scope.index = function () {
            return $scope.$index
        }, $scope.itemData = function () {
            return $scope.sortableScope.modelValue[$scope.$index]
        }
    }]), mainModule.directive("asSortableItem", ["sortableConfig", function (sortableConfig) {
        return {
            require: ["^asSortable", "?ngModel"],
            restrict: "A",
            controller: "ui.sortable.sortableItemController",
            link: function (scope, element, attrs, ctrl) {
                var sortableController = ctrl[0], ngModelController = ctrl[1];
                sortableConfig.itemClass && element.addClass(sortableConfig.itemClass), scope.sortableScope = sortableController.scope, ngModelController ? ngModelController.$render = function () {
                    scope.modelValue = ngModelController.$modelValue
                } : scope.modelValue = sortableController.scope.modelValue[scope.$index], scope.element = element
            }
        }
    }])
}();