export class Node {
	constructor (name, timeRequested) {
		this.name = name;
		this.tr = timeRequested;
		this.nexts = [];
		this.prevs = [],
		this.esimateVisited = false;
		this.latestVisited = false;
		this.drawnVisited = false;
		this.es = this.ef = null;
		this.ls = this.lf = null;
		this.drag = null;
	}
} 