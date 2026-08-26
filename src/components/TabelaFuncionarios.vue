<script setup>
defineProps({
  funcionarios: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="tabela-wrapper">
    <table class="tabela-funcionarios">
      <thead>
        <tr>
          <th>Funcionário</th>
          <th>Lavagens</th>
          <th>Faltas</th>
          <th>Atrasos</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="f in funcionarios" :key="f.nome">
          <td>{{ f.nome }}</td>
          <td>{{ f.lavagens }}</td>
          <td>{{ f.faltas }}</td>
          <td>{{ f.atrasos }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.tabela-wrapper {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  overflow: hidden;
}

.tabela-funcionarios {
  width: 100%;
  border-collapse: collapse;
}

.tabela-funcionarios th,
.tabela-funcionarios td {
  text-align: left;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
}

.tabela-funcionarios th {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.tabela-funcionarios tbody tr:last-child td {
  border-bottom: none;
}

.tabela-funcionarios tbody tr:hover {
  background: var(--bg-secondary);
}
</style>