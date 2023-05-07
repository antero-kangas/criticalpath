import { Node } from './js/node.js';

// make graph
/**
 * 
 * 
 * start
 * ->A->D -> end
 *    ->F ->end
 * ->B->F
 * ->C->E->end     
 */
const start = new Node ('start', 0);
const A = new Node ('A', 6);
const B = new Node ('B', 8);
const C = new Node ('C', 3);
const D = new Node ('D', 1);
const E =new Node ('E', 10);
const F = new Node ('F', 8);
const G = new Node('G', 1)
const end = new Node ('end', 0);

start.nexts = [A, B, C];	
A.nexts = [D,F];		
B.nexts = [F];				
C.nexts = [E];				
D.nexts = [end];			
E.nexts = [end];			
F.nexts = [G];	
G.nexts = [end];		
end.nexts = [];				

let net = [start, A, B, C, D, E, F, G, end];
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

function allDrawnVisited(nodes) {
	for (const node of nodes) {
		if (!node.drawnVisited) {
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
	let result = '';
	for (const node of net) {
		if (node===start) {
			result += '[<start>start]\n'
		} else if (node===end) {
			result += '[<end>end]\n'
		} else {
			result += '[<table>'+node.name+'|'
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