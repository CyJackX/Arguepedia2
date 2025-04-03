import { defineStore, acceptHMRUpdate } from 'pinia';
import type { Statement, Argument } from '../types/models';
import { useSupabase } from 'src/composables/useSupabase';

export const useStatementStore = defineStore('statement', {
  state: () => ({
    currentStatement: null as Statement | null,
    currentArgument: null as Argument | null,
  }),
  getters: {},
  actions: {
    setCurrentStatement(statement: Statement | null) {
      this.currentStatement = statement;
    },
    async fetchStatement(id: number) {
      const supabase = useSupabase();
      const statement = await supabase.fetchStatement(id);
      this.setCurrentStatement(statement);
    },
    setCurrentArgument(argument: Argument | null) {
      this.currentArgument = argument;
    },
    async fetchArgument(id: number) {
      const supabase = useSupabase();
      const argument = await supabase.fetchArgumentbyId(id);
      this.setCurrentArgument(argument);
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStatementStore, import.meta.hot));
}
