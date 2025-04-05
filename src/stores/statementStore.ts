import { defineStore, acceptHMRUpdate } from 'pinia';
import type { Statement, Argument } from '../types/models';
import { useSupabase } from 'src/composables/useSupabase';
const supabase = useSupabase();

export const useStatementStore = defineStore('statement', {
  state: () => ({
    currentStatement: null as Statement | null,
    currentArgument: null as Argument | null,
    isLoading: false as boolean,
  }),
  getters: {},
  actions: {
    setCurrentStatement(statement: Statement | null) {
      this.currentStatement = statement;
    },
    async fetchStatement(id: number) {
      this.isLoading = true;
      this.setCurrentStatement(await supabase.fetchStatement(id));
      this.isLoading = false;
    },
    setCurrentArgument(argument: Argument | null) {
      this.currentArgument = argument;
    },
    async fetchArgument(id: number) {
      this.setCurrentArgument(await supabase.fetchArgumentbyId(id));
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStatementStore, import.meta.hot));
}
