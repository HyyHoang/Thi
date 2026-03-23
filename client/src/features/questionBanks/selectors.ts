import { createSelector } from 'reselect';
import { RootState } from '../../app/store';

const selectQuestionBanksState = (state: RootState) => state.questionBanks;

export const selectQuestionBanks = createSelector(
    [selectQuestionBanksState],
    (state) => state.items
);

export const selectQuestionBanksLoading = createSelector(
    [selectQuestionBanksState],
    (state) => state.loading
);

export const selectQuestionBanksError = createSelector(
    [selectQuestionBanksState],
    (state) => state.error
);
