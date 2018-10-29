const hgt = require('node-hgt');
const Koa = require('koa');
const path = require('path')

var app = new Koa();

const serve = require('koa-static')

const KoaRouter = require('koa-router')
const router = new KoaRouter

const perf_hooks = require('perf_hooks')
const util = require('util');

hgt.TileSet.prototype.getElevationAsync = util.promisify(hgt.TileSet.prototype.getElevation);
var tileset = new hgt.TileSet('/media/chrx/SSD1/data/');

var getDepth = async function(lat, long){
	try{
		var elevation = await tileset.getElevationAsync([lat, long]);
	} catch (error){
		console.log("Invalid coordinate");
		return -1;
	}
	return elevation;
}


var gradient_descent = async function(J_history, precision, learning_rate, i){

	i--;
	if (i==0){return J_history};

	var coords = J_history[J_history.length - 1].slice(1, 3);

	var cost = await getDepth(coords[0], coords[1]);
	if (cost == 0){return J_history};

	var elev1 = getDepth(coords[0] + 0.001, coords[1]);
	var elev2 = getDepth(coords[0] - 0.001, coords[1]);
	var elev3 = getDepth(coords[0], coords[1] + 0.001);
	var elev4 = getDepth(coords[0], coords[1] - 0.001);

	var lat_slope = await elev1 / await elev2 - 1;
	var lon_slope = await elev3 / await elev4 - 1;

	console.log(i, await lat_slope, await lon_slope);

	if (Math.abs(lat_slope)+Math.abs(lon_slope) < precision){return J_history};

	coords[0] = coords[0] - learning_rate*lat_slope;
	coords[1] = coords[1] - learning_rate*lon_slope;

	await J_history.push([cost, coords[0], coords[1]]);

	return gradient_descent(J_history, precision, learning_rate, i)
}

var momentum_gradient_descent = async function(velocity, J_history, coords, alpha, gamma, i){
	i-=1;
	if (await i <= 0){return J_history};

	var cost = await getDepth(coords[0], coords[1]);
	await J_history.push([cost, coords[0], coords[1]]);
	if (cost <= 0){return J_history};

	var elev1 = getDepth(coords[0] + 0.001, coords[1]);
	var elev2 = getDepth(coords[0] - 0.001, coords[1]);
	var elev3 = getDepth(coords[0], coords[1] + 0.001);
	var elev4 = getDepth(coords[0], coords[1] - 0.001);

	console.log(await elev1, await elev2, await elev3, await elev4);

	var lat_slope = await elev1 / await elev2 - 1;
	var lon_slope = await elev3 / await elev4 - 1;

	velocity[0] = gamma * velocity[0] + alpha * lat_slope;
	velocity[1] = gamma * velocity[1] + alpha * lon_slope;

	coords[0] = coords[0] - velocity[0];
	coords[1] = coords[1] - velocity[1];

	console.log(coords, lat_slope, lon_slope, velocity);

	return momentum_gradient_descent(velocity, J_history, coords, alpha, gamma, i)
}


app.use(serve(__dirname + '/public'));

router.get('/', async ctx => {
	ctx.body = JSON.stringify(await getDepth(ctx.query.lat, ctx.query.long));
});

router.get('/gradient_descent_test', async ctx => {
	var J_history = await gradient_descent([[-1, parseFloat(ctx.query.lat), parseFloat(ctx.query.long)]], ctx.query.precision, ctx.query.learning_rate, 1000);
	for (item of J_history){console.log(item[2] + ", " + item[1])}
	ctx.body = await JSON.stringify(J_history);
});


router.get('/gradient_descent', async ctx => {
	console.log([ctx.query.lat, ctx.query.long], ctx.query.alpha, ctx.query.gamma, ctx.query.i)
	var J_history = await momentum_gradient_descent([0,0], [], [parseFloat(ctx.query.lat), parseFloat(ctx.query.long)], parseFloat(ctx.query.alpha), parseFloat(ctx.query.gamma), parseInt(ctx.query.i));
	for (item of J_history){console.log(item[2] + ", " + item[1])}
	ctx.body = await JSON.stringify(J_history);
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(8000);
