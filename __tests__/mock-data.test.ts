import { describe, it, expect } from "vitest";
import {
  PRODUCTS,
  REVIEWS,
  ECO_TIPS,
  getProductById,
  getProductByBarcode,
  getReviewsForProduct,
  getAlternatives,
  getGradeFromScore,
  GRADE_COLORS,
  GRADE_LABELS,
} from "../lib/mock-data";

describe("Mock Data", () => {
  it("should have at least 10 products", () => {
    expect(PRODUCTS.length).toBeGreaterThanOrEqual(10);
  });

  it("should have at least 5 reviews", () => {
    expect(REVIEWS.length).toBeGreaterThanOrEqual(5);
  });

  it("should have eco tips", () => {
    expect(ECO_TIPS.length).toBeGreaterThan(0);
  });

  it("all products should have required fields", () => {
    for (const product of PRODUCTS) {
      expect(product.id).toBeTruthy();
      expect(product.barcode).toBeTruthy();
      expect(product.name).toBeTruthy();
      expect(product.brand).toBeTruthy();
      expect(product.grade).toMatch(/^[A-E]$/);
      expect(product.score).toBeGreaterThanOrEqual(0);
      expect(product.score).toBeLessThanOrEqual(100);
      expect(product.carbonFootprint).toBeGreaterThanOrEqual(0);
      expect(product.packagingRecyclability).toBeGreaterThanOrEqual(0);
      expect(product.packagingRecyclability).toBeLessThanOrEqual(100);
      expect(["Local", "Regional", "National", "Imported"]).toContain(product.sourcing);
    }
  });
});

describe("getProductById", () => {
  it("should find product by id", () => {
    const product = getProductById("1");
    expect(product).toBeDefined();
    expect(product!.name).toBe("Organic Oat Milk");
  });

  it("should return undefined for unknown id", () => {
    expect(getProductById("nonexistent")).toBeUndefined();
  });
});

describe("getProductByBarcode", () => {
  it("should find product by barcode", () => {
    const product = getProductByBarcode("5901234123457");
    expect(product).toBeDefined();
    expect(product!.name).toBe("Organic Oat Milk");
  });

  it("should return undefined for unknown barcode", () => {
    expect(getProductByBarcode("0000000000000")).toBeUndefined();
  });
});

describe("getReviewsForProduct", () => {
  it("should return reviews for a product", () => {
    const reviews = getReviewsForProduct("1");
    expect(reviews.length).toBeGreaterThan(0);
    reviews.forEach((r) => expect(r.productId).toBe("1"));
  });

  it("should return empty array for product with no reviews", () => {
    const reviews = getReviewsForProduct("nonexistent");
    expect(reviews).toEqual([]);
  });
});

describe("getAlternatives", () => {
  it("should return alternative products", () => {
    const product = getProductById("2")!; // Almond Milk (C grade) has alternatives
    const alternatives = getAlternatives(product);
    expect(alternatives.length).toBeGreaterThan(0);
    alternatives.forEach((alt) => {
      expect(product.alternativeIds).toContain(alt.id);
      expect(alt.score).toBeGreaterThan(product.score); // Alternatives must be better rated
    });
  });

  it("should return empty array for top-rated products", () => {
    const product = getProductById("1")!; // Organic Oat Milk (A grade) has no better alternatives
    const alternatives = getAlternatives(product);
    expect(alternatives).toEqual([]);
  });

  it("should only return alternatives with better scores", () => {
    const product = getProductById("2")!; // Almond Milk (C grade, score 48)
    const alternatives = getAlternatives(product);
    alternatives.forEach((alt) => {
      expect(alt.score).toBeGreaterThan(product.score);
    });
  });

  it("should have variety of product grades in the database", () => {
    const grades = new Set(PRODUCTS.map(p => p.grade));
    expect(grades.has("A")).toBe(true);
    expect(grades.has("B")).toBe(true);
    expect(grades.has("C")).toBe(true);
    expect(grades.has("D")).toBe(true);
  });

  it("should have demo products with different grades", () => {
    const demoIds = ["1", "3", "2", "11"];
    const demoProducts = demoIds.map(id => getProductById(id)!);
    const grades = demoProducts.map(p => p.grade);
    expect(grades).toContain("A"); // Organic Oat Milk
    expect(grades).toContain("B"); // Soy Milk
    expect(grades).toContain("C"); // Almond Milk
    expect(grades).toContain("D"); // Standard Paper Towels
  });

});

describe("getGradeFromScore", () => {
  it("should return A for scores >= 80", () => {
    expect(getGradeFromScore(80)).toBe("A");
    expect(getGradeFromScore(100)).toBe("A");
    expect(getGradeFromScore(92)).toBe("A");
  });

  it("should return B for scores 60-79", () => {
    expect(getGradeFromScore(60)).toBe("B");
    expect(getGradeFromScore(79)).toBe("B");
  });

  it("should return C for scores 40-59", () => {
    expect(getGradeFromScore(40)).toBe("C");
    expect(getGradeFromScore(59)).toBe("C");
  });

  it("should return D for scores 20-39", () => {
    expect(getGradeFromScore(20)).toBe("D");
    expect(getGradeFromScore(39)).toBe("D");
  });

  it("should return E for scores < 20", () => {
    expect(getGradeFromScore(0)).toBe("E");
    expect(getGradeFromScore(19)).toBe("E");
  });
});

describe("Grade Colors and Labels", () => {
  it("should have colors for all grades", () => {
    const grades = ["A", "B", "C", "D", "E"] as const;
    grades.forEach((grade) => {
      expect(GRADE_COLORS[grade]).toBeDefined();
      expect(GRADE_COLORS[grade].bg).toBeTruthy();
      expect(GRADE_COLORS[grade].text).toBeTruthy();
    });
  });

  it("should have labels for all grades", () => {
    const grades = ["A", "B", "C", "D", "E"] as const;
    grades.forEach((grade) => {
      expect(GRADE_LABELS[grade]).toBeTruthy();
    });
  });
});
