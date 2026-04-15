export enum ReporterRoleName {
	SCHOOL = 'school',
	UNI = 'uni',
}

const INST_TYPE_TH_MAP: Record<ReporterRoleName, string> = {
	[ReporterRoleName.SCHOOL]: 'โรงเรียน',
	[ReporterRoleName.UNI]: 'มหาวิทยาลัย',
};

const normalizeRoleName = (value?: string): string => {
	if (!value) return '';
	return value
		.trim()
		.toLowerCase()
		.replace(/[_-]+/g, ' ')
		.replace(/\s+/g, ' ');
};

export const getInstTypeTH = (instType?: string): string => {
	const normalized = normalizeRoleName(instType) as ReporterRoleName;
	return INST_TYPE_TH_MAP[normalized] || instType || '-';
};
