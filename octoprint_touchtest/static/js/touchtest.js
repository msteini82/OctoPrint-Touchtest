/*
 * View model for OctoPrint-Touchtest
 *
 * Author: Daniel Miller
 * License: AGPLv3
 */
$(function() {
  function TouchtestViewModel(parameters) {
    var self = this;
    var homed = false;

    self.settings = parameters[0]
    self.loginState = parameters[1]

    self.bedWidth = ko.observable("200.00")
    self.bedDepth = ko.observable("200.00")
    self.edgeXOffset = ko.observable("15.00")
    self.edgeYOffset = ko.observable("15.00")
    self.feedrate = ko.observable("1000")
    self.isOperational = ko.observable(undefined);
    self.isPrinting = ko.observable(undefined);

    self.testPrint = function(wMult, dMult) {
        
      var wEffective = self.bedWidth() - 2* self.edgeXOffset()
      var dEffective = self.bedDepth() - 2* self.edgeYOffset()
      
      var xPos = 1.0*self.edgeXOffset() + (wMult*wEffective);
      var yPos = 1.0*self.edgeYOffset() + (dMult*dEffective);

      var code = [];
      if (!homed) { //Home the printer if not homed
        code.push("G28");
        homed = true;
      }

      code.push("G90"); //Set to Absolute Positioning
      code.push("G0 Z10"); //Raise bed 10mm
      code.push("G0 X" + xPos + " Y" + yPos + " F" + self.feedrate()); //Go to desired position
      code.push("G28 Z"); //Lower bed back to Home Z

      OctoPrint.control.sendGcode(code);
    }

    self.onBeforeBinding = function() {
      self.bedWidth(self.settings.settings.plugins.touchtest.bedWidth());
      self.bedDepth(self.settings.settings.plugins.touchtest.bedDepth());
      self.edgeXOffset(self.settings.settings.plugins.touchtest.edgeXOffset());
      self.edgeYOffset(self.settings.settings.plugins.touchtest.edgeYOffset());
      self.feedrate(self.settings.settings.plugins.touchtest.feedrate());
    }

    self.fromCurrentData = function(data) {
      self._processStateData(data.state);
    };

    self.fromHistoryData = function(data) {
      self._processStateData(data.state);
    };

    self._processStateData = function(data) {
      self.isOperational(data.flags.operational);
      self.isPrinting(data.flags.printing);
    };

    self.movementEnabled = function() {
      return (self.isOperational() && self.loginState.isUser() && ! self.isPrinting());
    }
  }

  // view model class, parameters for constructor, container to bind to
  OCTOPRINT_VIEWMODELS.push([
    TouchtestViewModel,
    [ "settingsViewModel", "loginStateViewModel" ],
    [ "#sidebar_plugin_touchtest" ]
  ]);
});
