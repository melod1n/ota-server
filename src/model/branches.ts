export class Branch {
	id: number;
	productId: number;
	name: string;
}

export class BranchUpdate {
	name: string;
}

export class BranchAdd {
	name: string;
	productId: number;
}
