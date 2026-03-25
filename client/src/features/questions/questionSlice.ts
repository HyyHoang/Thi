import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import questionService from '../../services/questionService';
import questionBankService from '../../services/questionBankService';
import { Question, QuestionPayload } from '../../types';

export interface QuestionsState {
    items: Question[];
    selected: Question | null;
    loading: boolean;
    error: string | null;
}

const initialState: QuestionsState = {
    items: [],
    selected: null,
    loading: false,
    error: null,
};

export const fetchQuestions = createAsyncThunk<Question[], Record<string, any> | undefined, { rejectValue: string }>(
    'questions/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const response = await questionService.getAll(params);
            const res = response as any;
            let items: Question[] = [];
            if (res?.data?.data && Array.isArray(res.data.data)) {
                items = res.data.data;
            } else if (Array.isArray(res?.data)) {
                items = res.data;
            } else if (Array.isArray(res)) {
                items = res;
            }
            return items;
        } catch (error: any) {
            const data = error?.response?.data;
            const status = error?.response?.status;
            let message = typeof data?.message === 'string'
                ? data.message
                : data?.errors?.message ?? error?.message ?? 'Không thể tải danh sách câu hỏi.';
            if (status === 401) {
                message = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
            } else if (status === 403) {
                message = message || 'Bạn không có quyền truy cập.';
            } else if (!error?.response && error?.message) {
                message = 'Không kết nối được máy chủ. Kiểm tra server đã chạy và CORS.';
            }
            return rejectWithValue(message);
        }
    }
);

export const createQuestion = createAsyncThunk<Question, QuestionPayload, { rejectValue: string }>(
    'questions/create',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await questionService.create(payload);
            return (response as any).data ? (response as any).data : response;
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Không thể tạo câu hỏi.';
            return rejectWithValue(message);
        }
    }
);

export const updateQuestion = createAsyncThunk<Question, { id: string; payload: QuestionPayload }, { rejectValue: string }>(
    'questions/update',
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            const response = await questionService.update(id, payload);
            return (response as any).data ? (response as any).data : response;
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Không thể cập nhật câu hỏi.';
            return rejectWithValue(message);
        }
    }
);

export const importQuestions = createAsyncThunk<{ imported: number; errors?: string[] }, File, { rejectValue: string }>(
    'questions/import',
    async (file, { rejectWithValue }) => {
        try {
            const response = await questionService.importCsv(file);
            const data = (response as any)?.data ?? response;
            const imported = data?.imported ?? data?.count ?? 0;
            const errors = data?.errors ?? [];
            return { imported, errors };
        } catch (error: any) {
            const data = error?.response?.data;
            const msg = data?.errors?.file?.[0] ?? data?.message;
            const message = typeof msg === 'string' ? msg : 'Import thất bại. Kiểm tra định dạng file (cần cột content/nội dung và type/loại).';
            return rejectWithValue(message);
        }
    }
);

export const deleteQuestion = createAsyncThunk<{ id: string }, string, { rejectValue: string }>(
    'questions/delete',
    async (id, { rejectWithValue }) => {
        try {
            await questionService.remove(id);
            return { id };
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Không thể xóa câu hỏi.';
            return rejectWithValue(message);
        }
    }
);

export const addQuestionsToChapter = createAsyncThunk<void, { bankId: string; chapterId: number; questionIds: string[] }, { rejectValue: string }>(
    'questions/addQuestionsToChapter',
    async ({ bankId, chapterId, questionIds }, { rejectWithValue }) => {
        try {
            await questionBankService.addQuestionsToChapter(bankId, chapterId, questionIds);
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Không thể thêm câu hỏi vào chương.';
            return rejectWithValue(message);
        }
    }
);

const questionSlice = createSlice({
    name: 'questions',
    initialState,
    reducers: {
        setSelectedQuestion(state, action: PayloadAction<Question | null>) {
            state.selected = action.payload;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchQuestions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchQuestions.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchQuestions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Lỗi khi tải danh sách';
            })
            .addCase(createQuestion.pending, (state) => {
                state.error = null;
            })
            .addCase(createQuestion.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })
            .addCase(createQuestion.rejected, (state, action) => {
                state.error = action.payload || 'Lỗi khi tạo';
            })
            .addCase(updateQuestion.pending, (state) => {
                state.error = null;
            })
            .addCase(updateQuestion.fulfilled, (state, action) => {
                const updated = action.payload;
                const index = state.items.findIndex(q => q.QuestionID === updated.QuestionID);
                if (index !== -1) {
                    state.items[index] = updated;
                }
            })
            .addCase(updateQuestion.rejected, (state, action) => {
                state.error = action.payload || 'Lỗi khi cập nhật';
            })
            .addCase(importQuestions.fulfilled, (state) => {
                state.error = null;
            })
            .addCase(importQuestions.rejected, (state, action) => {
                state.error = action.payload || 'Lỗi khi import';
            })
            .addCase(deleteQuestion.pending, (state) => {
                state.error = null;
            })
            .addCase(deleteQuestion.fulfilled, (state, action) => {
                state.items = state.items.filter(q => q.QuestionID !== action.payload.id);
            })
            .addCase(deleteQuestion.rejected, (state, action) => {
                state.error = action.payload || 'Lỗi khi xóa';
            });
    },
});

export const { setSelectedQuestion, clearError } = questionSlice.actions;

export default questionSlice.reducer;
