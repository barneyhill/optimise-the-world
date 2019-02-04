const hgt = require('node-hgt'); //node-hgt handles dataset requests
const Koa = require('koa'); //koa is my chosen web framework
const path = require('path');

var app = new Koa(); //Initalises Koa object

const serve = require('koa-static')

const KoaRouter = require('koa-router')
const router = new KoaRouter

const perf_hooks = require('perf_hooks')
const util = require('util');

hgt.TileSet.prototype.getElevationAsync = util.promisify(hgt.TileSet.prototype.getElevation); // Converts "getELevation" file into an asynchronous function

var tileset = new hgt.TileSet('/media/chrx/SSD4/data/'); // Creates a cache of all hgt files found on the SSD

// getDepth returns an elevation given two coordinates
var getDepth = async function(lat, lng){
	try{
		var elevation = await tileset.getElevationAsync([lat, lng]);
	} catch (error){
		console.log("Invalid coordinate");
		return -1;
	}
	return elevation;
}


var gradient_descent = async function(history, precision, learning_rate, i){

	i--;
	if (await i<=0){return history};

	var coords = history[history.length - 1].slice(1, 3);

	var elev1 = getDepth(coords[0] + 0.001, coords[1]);
	var elev2 = getDepth(coords[0] - 0.001, coords[1]);
	var elev3 = getDepth(coords[0], coords[1] + 0.001);
	var elev4 = getDepth(coords[0], coords[1] - 0.001);

	var lat_slope = await elev1 / await elev2 - 1;
	var lng_slope = await elev3 / await elev4 - 1;

	if (Math.abs(await lat_slope)+Math.abs(await lng_slope) < precision){
		console.log("Local minimum was reached!")
		return history
	};

	coords[0] = coords[0] - learning_rate*lat_slope;
	coords[1] = coords[1] - learning_rate*lng_slope;

	var cost = await getDepth(coords[0], coords[1]);

	if (cost <= 0){
		console.log("Sea level found!")
		await history.push([cost, coords[0], coords[1]]);
		return history
	};

	await history.push([cost, coords[0], coords[1]]);

	console.log(cost, coords[0], coords[1]);

	return gradient_descent(history, precision, learning_rate, i)
}
var momentum_gradient_descent = async function(velocity, history, precision, learning_rate, i){
	
	console.log(velocity, learning_rate)

	i-=1;
	if (await i <= 0){return history};

	console.log(history[history.length - 1]);

	var coords = history[history.length - 1].slice(1, 3);

	var elev1 = await getDepth(coords[0] + 0.001, coords[1]);
	var elev2 = await getDepth(coords[0] - 0.001, coords[1]);
	var elev3 = await getDepth(coords[0], coords[1] + 0.001);
	var elev4 = await getDepth(coords[0], coords[1] - 0.001);

	console.log(elev1,elev2,elev3,elev4)

	var lat_slope = elev1 / elev2 - 1;
	var lng_slope = elev3 / elev4 - 1;

	if (Math.abs(await lat_slope)+Math.abs(await lng_slope) < precision){
		console.log("Local minimum was reached!")
		return history
	};

	velocity[0] = (1-learning_rate) * velocity[0] + learning_rate * await lat_slope;
	velocity[1] = (1-learning_rate) * velocity[1] + learning_rate * await lng_slope;

	console.log(velocity)

	coords[0] = coords[0] - velocity[0];
	coords[1] = coords[1] - velocity[1];

	var cost = await getDepth(coords[0], coords[1]);

	console.log(cost, coords)

	if (cost <= 0){
		console.log("Sea level found!")

		console.log("Sea level found!")
		await history.push([cost, coords[0], coords[1]]);	
		return history;
	};

	await history.push([cost, coords[0], coords[1]]);

	return momentum_gradient_descent(velocity, history, precision, learning_rate, i);
}


app.use(serve(__dirname + '/public'));

//router.get('/depth', async ctx => {
//	ctx.body = JSON.stringify(await getDepth(ctx.query.lat, ctx.query.lng));
//});

router.get('/gradient_descent', async ctx => {
	console.log(ctx.query);
	if (parseFloat(ctx.query.precision) > 0 && parseFloat(ctx.query.precision) < 1){
		if (parseFloat(ctx.query.learning_rate) > 0 && parseFloat(ctx.query.learning_rate) < 1){
			if (ctx.query.algo == 'classical'){
				console.log("Running classic");
				var history = await gradient_descent([[getDepth(parseFloat(ctx.query.lat), parseFloat(ctx.query.lng)), parseFloat(ctx.query.lat), parseFloat(ctx.query.lng)]], parseFloat(ctx.query.precision), parseFloat(ctx.query.learning_rate), 1000);
				coordinates = [];
				for (item of history){coordinates.push({lat: item[1], lng: item[2], depth: item[0]})};
				ctx.body = await JSON.stringify(coordinates);
			}
			else if (ctx.query.algo == 'momentum') {
				console.log("Running momentum");
				var history = await momentum_gradient_descent([0,0], [[getDepth(parseFloat(ctx.query.lat), parseFloat(ctx.query.lng)), parseFloat(ctx.query.lat), parseFloat(ctx.query.lng)]], parseFloat(ctx.query.precision), parseFloat(ctx.query.learning_rate), 1000);
				coordinates = [];
				for (item of history){coordinates.push({lat: item[1], lng: item[2], depth: item[0]})};
				ctx.body = await JSON.stringify(coordinates);
			}
			else{
				ctx.body = "invalid_algorithm";
			}
		}
		else{
			ctx.body = "learning rate out of range";
		}
	}
	else{
		ctx.body = "precision out of range"
	}
});


app.use(router.routes()).use(router.allowedMethods());

app.listen(8888);
