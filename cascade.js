/**
 * Promise.cascade execute promises as separate groups of promises with interval between them.
 * It can be useful if you want to set limit
 * for simultaneously executing promise functions in one moment of time.
 * */
(function(){
	if (typeof Promise == "undefined") return;
	if (typeof Promise.cascade != "undefined") return;

	/**
	 * @param {Array} promises - array of functions (NOT promises)
	 * @param {Object} options
	 * @param {Number} options.interval
	 * @param {Number} options.stackSize
	 * */
	Promise.cascade = function(promises, options){

		if (typeof options != "object" || typeof options.join == "functions") options = Object.create(null);

		// Interval between stacks
		var interval = (
			typeof options.interval == "undefined"
				? 0
				: (
				isNaN(options.interval)
					? 0
					: parseInt(options.interval)
			)
		);

		/*
		 * Number of promises in stack.
		 * Promise inside stack proceeds through Promise.all(), parallel.
		 * */
		var stackSize = (
			typeof options.stackSize == "undefined"
				? 1
				: (
				isNaN(options.stackSize)
					? 1
					: parseInt(options.stackSize)
			)
		);

		// Objects into Array
		var tmp = [], c;
		var keys = Object.keys(promises);
		for(c=0; c<keys.length; c++){
			tmp.push(promises[keys[c]]);
		}
		promises = tmp;

		// Cycled promise function
		var func = function(resolve, reject){
			var promiseStack = [];

			var tmp = [], c;
			for (c = 0; c < promises.length; c++) {
				if (typeof promises[c] != "function") continue;
				tmp.push(promises[c]);
			}
			promises = tmp;

			if (!promises.length){
				resolve();
			}

			for (c = 0; c < promises.length; c++) {
				promiseStack.push(new Promise(promises[c]));

				promises[c] = null;

				if (
					promiseStack.length >= stackSize
					|| promises.length == (c + 1)
				) {
					break;
				}
			}

			Promise.all(promiseStack)
			.then(
				function () {
					setTimeout(
						function () {
							func(resolve,reject);
						},
						interval
					)
				}
			)
			.catch(
				function(e){
					reject(e);
				}
			);

		};

		return new Promise(func);

	};

})();