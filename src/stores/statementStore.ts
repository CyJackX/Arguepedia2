import { defineStore, acceptHMRUpdate } from 'pinia';
import type { Statement } from '../types/models';
import { useSupabase } from 'src/composables/useSupabase';

export const useStatementStore = defineStore('statement', {
  state: () => ({
    currentStatement: null as Statement | null,
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
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStatementStore, import.meta.hot));
}
