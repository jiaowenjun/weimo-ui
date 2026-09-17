declare module 'lunar-javascript' {
  export const Solar: {
    fromYmd(
      year: number,
      month: number,
      day: number,
    ): {
      getLunar(): {
        getYearInGanZhi(): string
        getMonthInChinese(): string
        getDayInChinese(): string
      }
    }
  }
}
