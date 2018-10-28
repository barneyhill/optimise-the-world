const hgt = require('node-hgt');
const Koa = require('koa');
const KoaRouter = require('koa-router')
const path = require('path')
var app = new Koa();
const router = new KoaRouter
const perf_hooks = require('perf_hooks')
const util = require('util');
hgt.TileSet.prototype.getElevationAsync = util.promisify(hgt.TileSet.prototype.getElevation);

var tileset = new hgt.TileSet('/media/chrx/SSD1/data/');
var getDepth = async function(lat, long){
	var elevation = await tileset.getElevationAsync([lat, long]);
	return elevation;
}

var recursive_gradient_descent = async function(velocity, J_history, coords, alpha, gamma, i){
	i-=1;
	if (await i <= 0){return J_history};

	var cost = await getDepth(coords[0], coords[1]);
	await J_history.push([cost, coords[0], coords[1]]);
	if (cost <= 0){return J_history};

	var elev1 = getDepth(coords[0] + 0.001, coords[1]);
	var elev2 = getDepth(coords[0] - 0.001, coords[1]);
	var elev3 = getDepth(coords[0], coords[1] + 0.001);
	var elev4 = getDepth(coords[0], coords[1] - 0.001);

	var lat_slope = await elev1 / await elev2 - 1;
	var lon_slope = await elev3 / await elev4 - 1;

	velocity[0] = gamma * velocity[0] + alpha * lat_slope;
	velocity[1] = gamma * velocity[1] + alpha * lon_slope;

	coords[0] = coords[0] - velocity[0];
	coords[1] = coords[1] - velocity[1];

	console.log(coords[0], coords[1], i);

	return recursive_gradient_descent(velocity, J_history, coords, alpha, gamma, i)
}

router.get('/', async ctx => {
	ctx.body = JSON.stringify(await getDepth(tileset, 53.2734, -7.7783))
});

router.get('/gradient_descent', async ctx => {
	console.log([ctx.query.lat, ctx.query.long], ctx.query.alpha, ctx.query.gamma, ctx.query.i)
	var J_history = await recursive_gradient_descent([0,0], [], [parseFloat(ctx.query.lat), parseFloat(ctx.query.long)], parseFloat(ctx.query.alpha), parseFloat(ctx.query.gamma), parseInt(ctx.query.i));
	ctx.body = await JSON.stringify(J_history);
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3002);
