import { Enrollment as GlobalEnrollment } from '../../types';

export type Enrollment = GlobalEnrollment;

export interface EnrollmentState {
  enrollments: Enrollment[];
  loading: boolean;
  error: string | null;
}
