import type { Assignment } from '#lib/types/assignments.ts';

const createAssignmentState = () => {
	let assignmentSelectorOpen = $state(false);
	let selectedAssignment = $state<Assignment | null>(null);
	let showInstructions = $state(true);
	let assignments = $state<Assignment[]>([]);

	const closeInstructions = () => {
		showInstructions = false;
	};
	const openInstructions = () => {
		showInstructions = true;
	};

	const closeAssignmentSelector = () => {
		assignmentSelectorOpen = false;
	};
	const openAssignmentSelector = () => {
		assignmentSelectorOpen = true;
	};
	const updateAssignments = (newAssignments: Assignment[]) => {
		assignments = newAssignments;
	};
	const updateSelectedAssignment = (assignment: Assignment) => {
		selectedAssignment = assignment;
	};

	return {
		get showAssignments() {
			return assignmentSelectorOpen;
		},
		get selectedAssignment() {
			return selectedAssignment;
		},
		get showInstructions() {
			return showInstructions;
		},
		get assignments() {
			return assignments;
		},
		updateAssignments,
		updateSelectedAssignment,
		closeInstructions,
		openInstructions,
		closeAssignmentSelector,
		openAssignmentSelector
	};
};

export const assignments = createAssignmentState();
