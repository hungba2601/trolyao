import type { TeacherProfile } from '../types';

export const getTeacherProfile = (): TeacherProfile | null => {
    const stored = localStorage.getItem('teacher_profile');
    return stored ? JSON.parse(stored) : null;
};

export const saveTeacherProfile = (profile: TeacherProfile) => {
    localStorage.setItem('teacher_profile', JSON.stringify(profile));
};
