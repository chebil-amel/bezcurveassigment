// mathUtils.ts
export const interpolate = (points: { x: number; y: number }[]) => {
	if (points.length < 2) return '';
	let path = `M ${points[0].x} ${points[0].y}`;
	for (let i = 1; i < points.length; i++) {
		path += ` L ${points[i].x} ${points[i].y}`;
	}
	return path;
};

export const approximate = (points: { x: number; y: number }[]) => {
	if (points.length < 2) return '';
	const cp1 = {
		x: (points[0].x + points[1].x) / 2,
		y: (points[0].y + points[1].y) / 2,
	};
	const cp2 = {
		x: (points[2].x + points[3].x) / 2,
		y: (points[2].y + points[3].y) / 2,
	};
	return `M ${points[0].x} ${points[0].y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${points[3].x} ${points[3].y}`;
};
