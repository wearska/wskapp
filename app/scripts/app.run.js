(function() {
    'use strict';

    angular
        .module('wearska')
        .run(runBlock);

    /** @ngInject */
    function runBlock($log) {

        $log.debug('runBlock end');
    }

})();
