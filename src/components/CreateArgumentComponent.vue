<script setup lang="ts">



</script>

<template>
  <q-card bordered>
    <q-expansion-item expand-separator expand-icon-toggle dense dense-toggle v-model="expanded"
      @before-show="handleBeforeShow">
      <template #header>
        <q-item-section side class="col-auto">
          <div class="text-caption">
            <div class="col">
              <div class="col-auto">
                ↑
              </div>
              <div class="col-auto">
                {{ props.argument.upvotes - props.argument.downvotes }}
              </div>
              <div class="col-auto">
                ↓
              </div>
            </div>
          </div>
        </q-item-section>
        <q-item-section>
          <div @click="() => router.push(`/argument/${props.argument.id}`)" class="text-body1 text-weight-bold">{{
            props.argument.title }}</div>
          <div class="text-caption">by
            <UsernameButton :username="props.argument.username" />
          </div>

        </q-item-section>

      </template>

      <template #default>
        <q-list v-if="!isLoading" dense separator>
          <template v-for="statementId in argument.statement_array" :key="statementId">
            <q-separator />
            <StatementComponent v-if="argumentStatementById(statementId)" sideStats flat
              :statement="argumentStatementById(statementId) as Statement" />
            <q-item v-else :inset-level=.67>
              <q-item-section>
                <q-item-label class="text-weight-bold">Statement ID: {{ statementId }} not found!</q-item-label>
              </q-item-section>
            </q-item>

          </template>
          <q-separator />
          <q-item :inset-level=.67>
            <q-item-section>
              <q-item-label>Thereby {{ conclusionLabel }} the conclusion:</q-item-label>
            </q-item-section>
          </q-item>
          <q-item :inset-level=.67>
            <q-item-section>
              <q-item-label>{{ conclusion?.statement_text }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </template>
    </q-expansion-item>
  </q-card>
</template>
