import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import courseSectionService from '../../services/courseSectionService';
import { ApiListResponse, ApiSingleResponse, CourseSection, CourseSectionPayload } from '../../types';

export interface CourseSectionsState {
    items: CourseSection[];
    selected?: CourseSection | null;
    loading: boolean;
    error?: string | null;
}

const initialState: CourseSectionsState = {
    items: [],
    selected: null,
    loading: false,
    error: null,
};

export const fetchCourseSections = createAsyncThunk<
    ApiListResponse<CourseSection>,
    void,
    { rejectValue: string }
>('courseSections/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = await courseSectionService.getAll();
        return response as unknown as ApiListResponse<CourseSection>;
    } catch (error: any) {
        const message = error?.response?.data?.message || 'Không thể tải danh sách lớp học phần.';
        return rejectWithValue(message);
    }
});

export const createCourseSection = createAsyncThunk<
    ApiSingleResponse<CourseSection>,
    CourseSectionPayload,
    { rejectValue: string }
>('courseSections/create', async (payload, { rejectWithValue }) => {
    try {
        const response = await courseSectionService.create(payload);
        return response as unknown as ApiSingleResponse<CourseSection>;
    } catch (error: any) {
        const message = error?.response?.data?.message || 'Không thể tạo lớp học phần.';
        return rejectWithValue(message);
    }
});

export const updateCourseSection = createAsyncThunk<
    ApiSingleResponse<CourseSection>,
    { id: string; payload: CourseSectionPayload },
    { rejectValue: string }
>('courseSections/update', async ({ id, payload }, { rejectWithValue }) => {
    try {
        const response = await courseSectionService.update(id, payload);
        return response as unknown as ApiSingleResponse<CourseSection>;
    } catch (error: any) {
        const message = error?.response?.data?.message || 'Không thể cập nhật lớp học phần.';
        return rejectWithValue(message);
    }
});

export const deleteCourseSection = createAsyncThunk<
    { id: string },
    string,
    { rejectValue: string }
>('courseSections/delete', async (id, { rejectWithValue }) => {
    try {
        await courseSectionService.remove(id);
        return { id };
    } catch (error: any) {
        const message = error?.response?.data?.message || 'Không thể xóa lớp học phần.';
        return rejectWithValue(message);
    }
});

const courseSectionsSlice = createSlice({
    name: 'courseSections',
    initialState,
    reducers: {
        setSelectedCourseSection(state, action: PayloadAction<CourseSection | null>) {
            state.selected = action.payload;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCourseSections.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCourseSections.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
            })
            .addCase(fetchCourseSections.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Không thể tải danh sách lớp học phần.';
            })
            .addCase(createCourseSection.pending, (state) => {
                state.error = null;
            })
            .addCase(createCourseSection.fulfilled, (state, action) => {
                state.items.push(action.payload.data);
            })
            .addCase(createCourseSection.rejected, (state, action) => {
                state.error = action.payload || 'Không thể tạo lớp học phần.';
            })
            .addCase(updateCourseSection.fulfilled, (state, action) => {
                const updated = action.payload.data;
                const index = state.items.findIndex((d) => d.SectionID === updated.SectionID);
                if (index !== -1) {
                    state.items[index] = updated;
                }
            })
            .addCase(updateCourseSection.rejected, (state, action) => {
                state.error = action.payload || 'Không thể cập nhật lớp học phần.';
            })
            .addCase(deleteCourseSection.fulfilled, (state, action) => {
                state.items = state.items.filter((d) => d.SectionID !== action.payload.id);
            })
            .addCase(deleteCourseSection.rejected, (state, action) => {
                state.error = action.payload || 'Không thể xóa lớp học phần.';
            });
    },
});

export const { setSelectedCourseSection, clearError } = courseSectionsSlice.actions;

export default courseSectionsSlice.reducer;
