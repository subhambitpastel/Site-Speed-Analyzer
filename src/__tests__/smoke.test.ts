describe("Smoke test", () => {
  it("should verify test infrastructure is working", () => {
    expect(true).toBe(true);
  });

  it("should have access to jsdom environment", () => {
    expect(typeof window).toBe("object");
    expect(typeof document).toBe("object");
  });
});
