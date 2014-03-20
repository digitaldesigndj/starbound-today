![StarBound Today](http://starbound.today/img/StarboundToday.svg)

### Get Started

Add your secrets... get an example from hackathon starter if you need to.

@todo, note secrets additions

git clone https://github.com/digitaldesigndj/starbound-today
cd starbound-today
git clone https://github.com/digitaldesigndj/starrydex-models models
touch server-monitor.log

### Start the applications

	forever start app.js - port 3000
	(starrydex - port 3001)
	forever start gumroad.js - port 3002
	forever start monitor.js

On shutdown, make sure user gets minimum token amount deducted.
Put shutdown server tasks into seperate module for use by the monitor and user destroy process.
Streamline users introduction to the service.
Cache DO API request for the pricing page, develop system to cache commandstar results.
