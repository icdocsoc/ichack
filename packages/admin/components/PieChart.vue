<template>
  <UCard>
    <!-- <h3 class="text-center font-semibold">{{ title }}</h3> -->
    <canvas ref="chart" />
  </UCard>
</template>

<script setup lang="ts">
import {
  Chart,
  PieController,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

type Props = {
  title: string;
  labels: string[];
  data: number[];
  color: string[];
};

const props = defineProps<Props>();

const chart = useTemplateRef<HTMLCanvasElement>('chart');

onMounted(() => {
  Chart.register(PieController, ArcElement, Tooltip, Legend, Title);
  try {
    new Chart(chart.value!.getContext('2d')!, {
      type: 'pie',
      data: {
        labels: props.labels,
        datasets: [
          {
            data: props.data,
            backgroundColor: props.color
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          },
          title: {
            display: true,
            text: props.title,
            font: {
              size: 24
            }
          }
        }
      }
    });
  } catch (e: any) {
    console.log(e);
  }
});
</script>
