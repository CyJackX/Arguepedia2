import { defineStore, acceptHMRUpdate } from 'pinia';
import type { Statement, Argument } from '../components/models';

export const useMyStore = defineStore('myStore', {
  state: () => ({
    currentStatement: null as Statement | null,
  }),
  getters: {
    currentStatement: (state) => state.currentStatement,
  },
  actions: {
    setCurrentStatement(statement: Statement) {
      this.currentStatement = statement;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMyStore, import.meta.hot));
}
