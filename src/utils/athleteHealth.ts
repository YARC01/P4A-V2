/**
 * Athletic Health, Ideal Weight, BMI & Nutrition / Training Advisor for Pickle 4 All
 */

export interface HealthAssessment {
  bmi: number;
  bmiCategory: 'Thiếu cân nhẹ' | 'Thể hình cân đối VĐV' | 'Cần giảm mỡ / siết cơ' | 'Thừa cân';
  idealWeightMinKg: number;
  idealWeightMaxKg: number;
  weightDifferenceKg: number; // current - ideal mid
  dailyWaterLiters: number;
  dailyProteinGrams: number;
  nutritionAdvice: string[];
  workoutAdvice: string[];
}

export function calculateAthleteHealth(
  heightCm: number,
  weightKg: number,
  gender: 'male' | 'female' | 'other' = 'male'
): HealthAssessment {
  const safeHeight = Math.max(120, Math.min(220, heightCm || 170));
  const safeWeight = Math.max(30, Math.min(180, weightKg || 65));
  const heightM = safeHeight / 100;
  const bmi = Number((safeWeight / (heightM * heightM)).toFixed(1));

  // Ideal weight range for agile racket / court athlete: BMI 20.0 to 23.5 for females, 21.0 to 24.2 for males
  const targetBmiMin = gender === 'female' ? 20.0 : 21.0;
  const targetBmiMax = gender === 'female' ? 23.0 : 24.2;

  const idealWeightMinKg = Math.round(targetBmiMin * heightM * heightM);
  const idealWeightMaxKg = Math.round(targetBmiMax * heightM * heightM);
  const idealMid = (idealWeightMinKg + idealWeightMaxKg) / 2;
  const weightDifferenceKg = Number((safeWeight - idealMid).toFixed(1));

  let bmiCategory: HealthAssessment['bmiCategory'] = 'Thể hình cân đối VĐV';
  if (bmi < targetBmiMin) {
    bmiCategory = 'Thiếu cân nhẹ';
  } else if (bmi > targetBmiMax && bmi <= targetBmiMax + 2.5) {
    bmiCategory = 'Cần giảm mỡ / siết cơ';
  } else if (bmi > targetBmiMax + 2.5) {
    bmiCategory = 'Thừa cân';
  }

  // Hydration & Protein targets
  const dailyWaterLiters = Number(((safeWeight * 0.04) + 0.8).toFixed(1)); // Base + court sweat compensation
  const dailyProteinGrams = Math.round(safeWeight * 1.8); // 1.8g per kg for high performance athlete

  // Dynamic tailored nutrition advice
  const nutritionAdvice: string[] = [
    `Bổ sung ${dailyProteinGrams}g Protein mỗi ngày (ức gà, cá hồi, trứng, đậu hũ) để phục hồi sợi cơ sau các pha bứt tốc.`,
    `Nạp Carb chuyển hóa chậm (yến mạch, khoai lang, gạo lứt) 90-120 phút trước khi vào sân để duy trì thể lực dẻo dai.`,
    `Uống tối thiểu ${dailyWaterLiters}L nước/ngày. Bổ sung gói điện giải (Oresol/Revive không đường) sau mỗi set đấu căng thẳng.`,
    `Ăn nhẹ chuối hoặc thanh hạt dinh dưỡng giữa các hiệp để tránh tụt đường huyết khi thi đấu kéo dài.`,
  ];

  if (weightDifferenceKg > 3) {
    nutritionAdvice.unshift(`Hiện cân nặng cao hơn chuẩn VĐV khoảng ${weightDifferenceKg}kg: Cắt giảm đường tinh luyện và tinh bột xấu, tăng rau xanh để tăng tốc độ di chuyển.`);
  } else if (weightDifferenceKg < -3) {
    nutritionAdvice.unshift(`Hiện cân nặng nhẹ hơn chuẩn VĐV khoảng ${Math.abs(weightDifferenceKg)}kg: Bổ sung sinh tố năng lượng, quả bơ, hạt óc chó để tăng sức va chạm và độ đầm khi smash.`);
  }

  // Dynamic tailored workout advice
  const workoutAdvice: string[] = [
    'Bài tập cổ tay & cẳng tay (Wrist Curls & Reverse Curls): 3 hiệp x 15 lần để tăng uy lực topspin và flick cổ tay.',
    'Di chuyển chân Split-Step & Agility Ladder: 15 phút mỗi buổi để rèn phản xạ bật nhảy và giữ thăng bằng tại Kitchen.',
    'Tập cốt lõi (Core Planks & Russian Twists): 4 hiệp x 45 giây để trụ vững khi thực hiện cú drive chéo sân.',
    'Giãn cơ động trước trận và giãn cơ tĩnh 10 phút sau trận với foam roller để phòng tránh viêm gân gót chân (Achilles) và chấn thương cùi chỏ (Tennis/Pickleball elbow).',
  ];

  return {
    bmi,
    bmiCategory,
    idealWeightMinKg,
    idealWeightMaxKg,
    weightDifferenceKg,
    dailyWaterLiters,
    dailyProteinGrams,
    nutritionAdvice,
    workoutAdvice,
  };
}
