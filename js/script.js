const form = document.getElementById("healthForm");

const weightInput = document.getElementById("weight");
const heightInput = document.getElementById("height");
const waterInput = document.getElementById("water");
const sleepInput = document.getElementById("sleep");
const stepsInput = document.getElementById("steps");
const moodInput = document.getElementById("mood");

const bmiValue = document.getElementById("bmiValue");
const bmiCategory = document.getElementById("bmiCategory");
const healthScore = document.getElementById("healthScore");
const healthLevel = document.getElementById("healthLevel");
const statusTitle = document.getElementById("statusTitle");
const statusSummary = document.getElementById("statusSummary");
const statusPoints = document.getElementById("statusPoints");

const statWater = document.getElementById("statWater");
const statSleep = document.getElementById("statSleep");
const statSteps = document.getElementById("statSteps");
const statMood = document.getElementById("statMood");

const previewWater = document.getElementById("previewWater");
const previewSleep = document.getElementById("previewSleep");
const previewSteps = document.getElementById("previewSteps");
const previewMood = document.getElementById("previewMood");

const canvas = document.getElementById("healthCanvas");
const ctx = canvas.getContext("2d");

const targets = {
  water: 2000,
  sleep: 8,
  steps: 10000
};

const state = {
  water: 0,
  sleep: 0,
  steps: 0,
  mood: "-"
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatNumber(value, digits = 1) {
  return Number.isFinite(value) ? value.toFixed(digits) : "0.0";
}

function getMoodScore(mood) {
  const scores = {
    Happy: 100,
    Normal: 78,
    Tired: 52,
    Stress: 35
  };
  return scores[mood] ?? 0;
}

function getMoodNote(mood) {
  const notes = {
    Happy: "Mood kamu positif dan mendukung kondisi tubuh secara keseluruhan.",
    Normal: "Mood stabil. Ini cukup baik untuk menjaga ritme aktivitas harian.",
    Tired: "Kamu terlihat kelelahan. Cek lagi kualitas tidur dan beban aktivitas.",
    Stress: "Tingkat stres perlu ditekan karena bisa memengaruhi kondisi tubuh."
  };
  return notes[mood] ?? "Mood belum dipilih.";
}

function getBmiCategory(bmi) {
  if (!Number.isFinite(bmi) || bmi <= 0) return "Belum dihitung";
  if (bmi < 18.5) return "Kurus";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Kelebihan Berat Badan";
  return "Obesitas";
}

function getBmiScore(bmi) {
  if (!Number.isFinite(bmi) || bmi <= 0) return 0;

  if (bmi >= 18.5 && bmi <= 24.9) return 100;
  if (bmi >= 17 && bmi < 18.5) return 72;
  if (bmi >= 25 && bmi < 29.9) return 65;
  if (bmi < 17) return 42;
  return 38;
}

function getWaterScore(water) {
  if (!Number.isFinite(water) || water <= 0) return 0;
  const ratio = water / targets.water;
  return clamp(Math.round(ratio * 100), 0, 100);
}

function getSleepScore(sleep) {
  if (!Number.isFinite(sleep) || sleep <= 0) return 0;
  if (sleep >= 7 && sleep <= 9) return 100;
  if (sleep >= 6 && sleep < 7) return 78;
  if (sleep > 9 && sleep <= 10) return 82;
  if (sleep >= 5 && sleep < 6) return 56;
  return 30;
}

function getStepsScore(steps) {
  if (!Number.isFinite(steps) || steps <= 0) return 0;
  const ratio = steps / targets.steps;
  return clamp(Math.round(ratio * 100), 0, 100);
}

function getHealthLevel(score) {
  if (score >= 75) return "Sehat";
  if (score >= 50) return "Perlu Perbaikan";
  return "Perlu Perhatian";
}

function getStatusInfo(score, bmiCategoryText, bmi) {
  const level = getHealthLevel(score);

  if (level === "Sehat") {
    return {
      title: "Kondisi tubuhmu tergolong sehat",
      summary: `Skor analisis menunjukkan hasil yang baik. BMI kamu berada di kategori ${bmiCategoryText.toLowerCase()} dan kebiasaan harianmu cukup mendukung.`,
      points: [
        "Pertahankan pola makan yang konsisten.",
        "Jaga tidur, minum air, dan langkah harian tetap stabil.",
        "Lanjutkan kebiasaan baik tanpa loncat ekstrem."
      ]
    };
  }

  if (level === "Perlu Perbaikan") {
    return {
      title: "Kondisi cukup baik, tapi belum ideal",
      summary: `Skor kamu masih berada di zona tengah. BMI ${formatNumber(bmi, 1)} perlu dipadukan dengan tidur, air minum, dan aktivitas yang lebih rapi.`,
      points: [
        "Naikkan kualitas tidur ke 7–9 jam.",
        "Tambahkan asupan air dan aktivitas fisik.",
        "Perbaiki satu kebiasaan dulu, jangan semua sekaligus."
      ]
    };
  }

  return {
    title: "Kondisi tubuh perlu perhatian",
    summary: `Hasil analisis belum aman. BMI kamu dan kebiasaan harian perlu dibenahi agar kondisi tubuh tidak makin turun.`,
    points: [
      "Perbaiki pola tidur dan kurangi stres.",
      "Pastikan minum cukup air dan bergerak lebih aktif.",
      "Kalau ada keluhan fisik, cek ke tenaga kesehatan."
    ]
  };
}

function updatePreview(data) {
  previewWater.textContent = `${data.water} ml`;
  previewSleep.textContent = `${formatNumber(data.sleep, 1)} Jam`;
  previewSteps.textContent = `${data.steps}`;
  previewMood.textContent = data.mood || "-";

  statWater.textContent = `${data.water} ml`;
  statSleep.textContent = `${formatNumber(data.sleep, 1)} Jam`;
  statSteps.textContent = `${data.steps}`;
  statMood.textContent = data.mood || "-";
}

function drawChart(data) {
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  const padding = {
    top: 24,
    right: 28,
    bottom: 54,
    left: 64
  };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const baseY = height - padding.bottom;

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Axes
  ctx.strokeStyle = "rgba(22,49,47,0.10)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, baseY);
  ctx.lineTo(width - padding.right, baseY);
  ctx.stroke();

  const metrics = [
    {
      label: "Water",
      value: data.water,
      max: targets.water,
      fill: "#5ca8ff"
    },
    {
      label: "Sleep",
      value: data.sleep,
      max: targets.sleep,
      fill: "#3fbf9f"
    },
    {
      label: "Steps",
      value: data.steps,
      max: targets.steps,
      fill: "#7b8cff"
    }
  ];

  const spacing = 30;
  const barWidth = (chartWidth - spacing * 2) / metrics.length - 24;
  const startX = padding.left + 18;

  // Grid lines
  ctx.font = "600 14px system-ui, sans-serif";
  ctx.fillStyle = "rgba(94,112,109,0.9)";
  ctx.strokeStyle = "rgba(22,49,47,0.06)";

  [0.25, 0.5, 0.75, 1].forEach((ratio) => {
    const y = baseY - chartHeight * ratio;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    const label = `${Math.round(ratio * 100)}%`;
    ctx.fillText(label, 16, y + 5);
  });

  metrics.forEach((item, index) => {
    const x = startX + index * (barWidth + spacing + 24);
    const ratio = clamp(item.value / item.max, 0, 1);
    const barHeight = chartHeight * ratio;
    const y = baseY - barHeight;

    // Bar shadow
    ctx.fillStyle = "rgba(22,49,47,0.06)";
    roundRect(ctx, x + 4, y + 6, barWidth, barHeight, 18);
    ctx.fill();

    // Bar
    ctx.fillStyle = item.fill;
    roundRect(ctx, x, y, barWidth, barHeight, 18);
    ctx.fill();

    // Value
    ctx.fillStyle = "#16312f";
    ctx.font = "700 16px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(item.value), x + barWidth / 2, y - 12);

    // Label
    ctx.fillStyle = "rgba(94,112,109,0.95)";
    ctx.font = "700 15px system-ui, sans-serif";
    ctx.fillText(item.label, x + barWidth / 2, baseY + 26);

    // Max
    ctx.font = "500 13px system-ui, sans-serif";
    ctx.fillText(`Target ${item.max}`, x + barWidth / 2, baseY + 46);
  });

  ctx.textAlign = "start";
}

function roundRect(context, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + w, y, x + w, y + h, radius);
  context.arcTo(x + w, y + h, x, y + h, radius);
  context.arcTo(x, y + h, x, y, radius);
  context.arcTo(x, y, x + w, y, radius);
  context.closePath();
}

function setResultText(score, bmi, bmiCategoryText, mood) {
  const level = getHealthLevel(score);
  const status = getStatusInfo(score, bmiCategoryText, bmi);

  bmiValue.textContent = formatNumber(bmi, 1);
  bmiCategory.textContent = bmiCategoryText;
  healthScore.textContent = `${score}%`;
  healthLevel.textContent = level;

  statusTitle.textContent = status.title;
  statusSummary.textContent = `${status.summary} ${getMoodNote(mood)}`;

  statusPoints.innerHTML = status.points
    .map((point) => `<li>${point}</li>`)
    .join("");

  document.documentElement.style.setProperty(
    "--status-accent",
    level === "Sehat" ? "#3fbf9f" : level === "Perlu Perbaikan" ? "#5ca8ff" : "#d97c55"
  );
}

function calculate() {
  const weight = parseFloat(weightInput.value);
  const heightCm = parseFloat(heightInput.value);
  const water = parseInt(waterInput.value, 10);
  const sleep = parseFloat(sleepInput.value);
  const steps = parseInt(stepsInput.value, 10);
  const mood = moodInput.value;

  if (
    !Number.isFinite(weight) ||
    !Number.isFinite(heightCm) ||
    !Number.isFinite(water) ||
    !Number.isFinite(sleep) ||
    !Number.isFinite(steps) ||
    !mood
  ) {
    alert("Lengkapi semua data terlebih dulu.");
    return;
  }

  const heightM = heightCm / 100;
  const bmi = weight / (heightM * heightM);
  const bmiCategoryText = getBmiCategory(bmi);

  const bmiScore = getBmiScore(bmi);
  const waterScore = getWaterScore(water);
  const sleepScore = getSleepScore(sleep);
  const stepsScore = getStepsScore(steps);
  const moodScore = getMoodScore(mood);

  const score =
    (bmiScore * 0.35) +
    (waterScore * 0.2) +
    (sleepScore * 0.2) +
    (stepsScore * 0.15) +
    (moodScore * 0.1);

  const finalScore = clamp(Math.round(score), 0, 100);

  state.water = water;
  state.sleep = sleep;
  state.steps = steps;
  state.mood = mood;

  updatePreview(state);
  setResultText(finalScore, bmi, bmiCategoryText, mood);
  drawChart(state);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  calculate();
});

document.addEventListener("DOMContentLoaded", () => {
  updatePreview(state);
  setResultText(0, 0, "Menunggu perhitungan...", "Normal");
  drawChart({
    water: 0,
    sleep: 0,
    steps: 0,
    mood: "-"
  });
});