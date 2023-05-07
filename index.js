import { Node } from './js/node.js';

// make graph
/**
 * https://nomnoml.com/#file/criticalpath
 * 
 * start
 * ->A->D -> end
 *    ->F ->end
 * ->B->F
 * ->C->E->end     
 */
const start = new Node ('start', 0);
const maA = new Node ('määrittely A', 6);
const epA = new Node ('elementtiproto A', 8);
const toA = new Node ('toteutus A', 3);
const teA = new Node ('testaus A', 1);
const maB = new Node ('määrittely B', 5);
const epB = new Node ('elementtiproto B', 7);
const toB = new Node ('toteutus B', 2);
const teB = new Node ('testaus B', 2);
const teAB = new Node ('testaus AB', 1);
const maC = new Node ('määrittely C', 8);
const epC = new Node ('elementtiproto C', 4);
const toC = new Node ('toteutus C', 8);
const teC = new Node ('testaus C', 2);
const teABC = new Node ('testaus ABC', 1);
const end = new Node ('end', 0);

start.nexts = [maA, maB, maC];	
maA.nexts = [epA];		
epA.nexts = [toA, epB];
toA.nexts = [teA];		
teA.nexts = [teAB];		
maB.nexts = [epB];		
epB.nexts = [toB];
toB.nexts = [teB, toC];
teB.nexts = [teAB];
teAB.nexts = [teABC];		
maC.nexts = [epC, epB];		
epC.nexts = [toC];
toC.nexts = [teC];		
teC.nexts = [teABC];
teABC.nexts = [end];	
end.nexts = [];				

let net = [
	start, 
	maA, epA, toA, teA, 
	maB, epB, toB, teB, teAB,
	maC, epC, toC, teC, teC, teABC, 
	end
];
net.forEach(node => {
	node.nexts.forEach(next => {
		next.prevs.push(node)
	})
})

start.es = 0
start.ef = start.es + start.tr;
start.estimatedVisited = true;

function printNet(header, net) {
	console.log("\n"+header);
	net.forEach(node => {
		let nexts = [];
		node.nexts.forEach(next=>{nexts.push(next.name)});
		let prevs = [];
		node.prevs.forEach(prev=>{prevs.push(prev.name)});
		console.log(node.name, node.es, node.tr, node.ef, node.ls, node.drag, node.lf, node.estimatedVisited, node.latestVisited, nexts, prevs);
	});
}
//printNet("init", net);

let notReady = [start];
notReady.forEach(node => {
	computeNexts(node);
})

//printNet("estimated", net);


end.lf = end.ef;
end.ls = end.lf - end.tr;
end.latestVisited = true;
notReady = [end];
notReady.forEach(node => {
	computePrevs(node);
})

printNet("latest", net);

console.log(nomnoml(net, start, end))

function computeNexts(node){
	node.nexts.forEach(next => {
		if (!next.estimatedVisited && allEstimatedVisited(next.prevs)) {
			next.es = maxEf(next.prevs);
			next.ef = next.es + next.tr;
			next.estimatedVisited = true;
			computeNexts(next)
		} else {
			notReady.push(next);
		}
	})
}

function allEstimatedVisited(nodes) {
	for (const node of nodes) {
		if (!node.estimatedVisited) {
			return false;
		}
	}
	return true;
}

function maxEf(nodes) {
	let max = 0;
	for (const node of nodes) {
		if (node.ef > max) {
			max = node.ef
		}
	}
	return max;
}

function computePrevs(node){
	node.prevs.forEach(prev => {
		if (!prev.latestVisited && allLatestVisited(prev.nexts)) {
			prev.lf = minLs(prev.nexts);
			prev.ls = prev.lf - prev.tr;
			prev.latestVisited = true;
			prev.drag = prev.ls -prev.es;
			computePrevs(prev)
		} else {
			notReady.push(prev);
		}
	})
}

function allLatestVisited(nodes) {
	for (const node of nodes) {
		if (!node.latestVisited) {
			return false;
		}
	}
	return true;
}

function minLs(nodes) {
	let min = Infinity;
	for (const node of nodes) {
		if (node.ls < min) {
			min = node.ls
		}
	}
	return min ;
}

function nomnoml(net, start, end) {
	let result = '#direction: right\n';
	result += '#.crit: visual=table fill=red title=bold\n';
	for (const node of net) {
		if (node===start) {
			result += '[<start>start]\n'
		} else if (node===end) {
			result += '[<end>end]\n'
		} else {
			if (node.drag==0) {
				result += '[<crit>'
			} else {
				result += '[<table>'
			}
			result += node.name+'|'
				+ node.es+'|'+node.tr+'|'+node.ef+'||'
				+ node.ls+'|'+node.drag+'|'+node.lf+']\n';
		}
	}

	const notReady = [start];
	notReady.forEach(node => connect(node))
	
	function connect(node) {
		if (!node.drawnVisited ) {
			node.nexts.forEach(next => {
				result += '['+node.name+'] -> ['+next.name+']\n';
				connect(next)
			}) 		
			node.drawnVisited = true;
		};
	}
	
	return result
}