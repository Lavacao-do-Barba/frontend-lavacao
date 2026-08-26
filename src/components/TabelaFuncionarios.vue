<script setup>
defineProps({
  funcionarios: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
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
</template>

<style scoped>
.tabela-funcionarios {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.tabela-funcionarios th,
.tabela-funcionarios td {
  text-align: left;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
}

.tabela-funcionarios th {
  background: #f7f7f7;
  font-size: 0.85rem;
  color: #666;
}
</style>    