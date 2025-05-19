import type { Mensuration } from '../../../../types/measurements';

export const calculateTotalLost = (mensurations: Mensuration[]) => {
  if (mensurations.length < 2) return null;
  
  const firstMeasurement = mensurations[0];
  const lastMeasurement = mensurations[mensurations.length - 1];

  const calculateDiff = (first: string, last: string) => {
    const firstVal = parseFloat(first) || 0;
    const lastVal = parseFloat(last) || 0;
    return firstVal - lastVal;
  };

  return {
    bustLine: calculateDiff(firstMeasurement.bustLine, lastMeasurement.bustLine),
    underBust: calculateDiff(firstMeasurement.underBust, lastMeasurement.underBust),
    waist: calculateDiff(firstMeasurement.waist, lastMeasurement.waist),
    belly: calculateDiff(firstMeasurement.belly, lastMeasurement.belly),
    hips: calculateDiff(firstMeasurement.hips, lastMeasurement.hips),
    rightArm: calculateDiff(firstMeasurement.rightArm, lastMeasurement.rightArm),
    leftArm: calculateDiff(firstMeasurement.leftArm, lastMeasurement.leftArm),
    rightThigh: calculateDiff(firstMeasurement.rightThigh, lastMeasurement.rightThigh),
    leftThigh: calculateDiff(firstMeasurement.leftThigh, lastMeasurement.leftThigh),
    rightCalf: calculateDiff(firstMeasurement.rightCalf, lastMeasurement.rightCalf),
    leftCalf: calculateDiff(firstMeasurement.leftCalf, lastMeasurement.leftCalf)
  };
};