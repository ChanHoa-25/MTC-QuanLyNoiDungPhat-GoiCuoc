// Thuật toán tính toán đổi gói cước theo mục SYS-ORG-10 (SRS Trang 5-6)

export interface PackageSwitchParams {
  oldPrice: number; // A: Giá gói cũ
  oldTotalDays: number; // B: Số ngày hạn gói cũ
  usedDays: number; // C: Số ngày đã dùng gói cũ
  newPrice: number; // D: Giá gói mới
  newTotalDays: number; // E: Số ngày hạn gói mới
  isUnlimitedOld?: boolean;
  isUnlimitedNew?: boolean;
}

export interface PackageSwitchResult {
  isUpgrade: boolean; // Gói mới giá cao hơn hay thấp hơn
  oldResidualValue: number; // Giá trị còn lại của gói cũ: A - C * (A / B)
  compensationDays?: number; // Số ngày bù (nếu đổi sang gói thấp hơn)
  deductionAmount?: number; // Số tiền được trừ F (nếu đổi sang gói cao hơn)
  finalAmountToPay: number; // Tổng thực thu người dùng cần thanh toán
  explanation: string;
}

/**
 * Tính toán đổi gói cước:
 * - Đổi sang gói giá thấp hơn: Số ngày bù = [A - C * (A / B)] / (D / E)
 * - Đổi sang gói giá cao hơn: F = A - C * (A / B); Tổng thực thu = D - F
 * - Đổi giữa gói không thời hạn và có thời hạn: không bù, tính như bình thường
 */
export function calculatePackageSwitch(params: PackageSwitchParams): PackageSwitchResult {
  const { oldPrice, oldTotalDays, usedDays, newPrice, newTotalDays, isUnlimitedOld, isUnlimitedNew } = params;

  if (isUnlimitedOld || isUnlimitedNew) {
    return {
      isUpgrade: newPrice > oldPrice,
      oldResidualValue: 0,
      finalAmountToPay: newPrice,
      explanation: 'Đổi giữa gói không thời hạn và có thời hạn: Không áp dụng công thức bù, tính phí nguyên giá.',
    };
  }

  // Giá trị mỗi ngày của gói cũ
  const dailyRateOld = oldTotalDays > 0 ? oldPrice / oldTotalDays : 0;
  // Giá trị còn dư chưa sử dụng của gói cũ
  const residualValue = Math.max(0, oldPrice - usedDays * dailyRateOld);

  if (newPrice < oldPrice) {
    // Đổi sang gói giá thấp hơn -> Tính số ngày bù cho gói mới
    const dailyRateNew = newTotalDays > 0 ? newPrice / newTotalDays : 1;
    const rawCompensationDays = residualValue / dailyRateNew;
    const compensationDays = Math.round(rawCompensationDays);

    return {
      isUpgrade: false,
      oldResidualValue: Math.round(residualValue),
      compensationDays,
      finalAmountToPay: 0,
      explanation: `Đổi sang gói giá thấp hơn. Giá trị còn dư (${residualValue.toLocaleString('vi-VN')} đ) được quy đổi thành +${compensationDays} ngày bù cho gói mới. Người dùng không phải trả thêm tiền.`,
    };
  } else {
    // Đổi sang gói giá cao hơn -> F là số tiền được trừ, Tổng thực thu = D - F
    const deduction = residualValue;
    const finalToPay = Math.max(0, newPrice - deduction);

    return {
      isUpgrade: true,
      oldResidualValue: Math.round(residualValue),
      deductionAmount: Math.round(deduction),
      finalAmountToPay: Math.round(finalToPay),
      explanation: `Đổi sang gói giá cao hơn. Được khấu trừ ${Math.round(deduction).toLocaleString('vi-VN')} đ từ thời gian chưa dùng của gói cũ. Tổng thực thu cần trả: ${Math.round(finalToPay).toLocaleString('vi-VN')} đ.`,
    };
  }
}
