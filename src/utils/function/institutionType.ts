export const mapInstitutionType = (type?: string): string => {
    const normalizedType = type?.toLowerCase();

    if (normalizedType === 'school') return 'โรงเรียน';
    if (normalizedType === 'uni') return 'มหาวิทยาลัย';

    return type || '-';
};
