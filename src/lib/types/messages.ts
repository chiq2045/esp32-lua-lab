import type { CircuitComponent } from '#lib/types/project.ts';

export type WorkerInput =
	| {
			type: 'run';
			code: string;
			components: CircuitComponent[];
	  }
	| {
			type: 'button';
			id: string;
			pressed: boolean;
	  };

export type WorkerOutput =
	| { type: 'started' }
	| { type: 'finished' }
	| { type: 'error'; message: string }
	| { type: 'serial'; message: string }
	| {
			type: 'component';
			id: string;
			on: boolean;
	  };
