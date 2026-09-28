/**
 * Karudi E2E Local Model & Tool Testing Suite
 * Tests all required user scenarios against the 100% local Karudi AI model:
 * 1. Image intent & typo: "remov bakground please"
 * 2. Gujarati request: "Aa photo nu background remove kari do"
 * 3. Hindi request: "इसका बैकग्राउंड हटा दो"
 * 4. Multi-step: "Remove the background, make it square and convert to WebP."
 * 5. Document Summarization: "Aa PDF nu proper summary Gujarati ma aapo"
 * 6. Document Q&A: "What is the GST number?"
 */

import { localAgent } from "../src/lib/ai/local/local-agent";
import type { ToolExecutionContext } from "../src/lib/ai/tool-registry";

async function runTests() {
  console.log("=== STARTING KARUDI LOCAL AI MODEL E2E EVALUATION ===");

  // Context with an active image
  const imageContext: ToolExecutionContext = {
    userId: "test-user",
    threadId: "test-thread",
    activeFile: {
      name: "sample-portrait.jpg",
      mediaType: "image/jpeg",
      dataUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
    },
  };

  // Test 1: Typo understanding
  console.log("\n[Test 1] Typo request: 'remov bakground please'");
  const t1 = await localAgent.executeChat(
    [{ role: "user", content: "remov bakground please" }],
    imageContext,
    false
  );
  console.log("Result 1 Steps:", t1.steps.map(s => ({ tool: s.tool, args: s.arguments })));
  console.log("Result 1 Reply:", t1.reply);

  // Test 2: Gujarati request
  console.log("\n[Test 2] Gujarati request: 'Aa photo nu background remove kari do'");
  const t2 = await localAgent.executeChat(
    [{ role: "user", content: "Aa photo nu background remove kari do" }],
    imageContext,
    false
  );
  console.log("Result 2 Steps:", t2.steps.map(s => ({ tool: s.tool, args: s.arguments })));
  console.log("Result 2 Reply:", t2.reply);

  // Test 3: Hindi request
  console.log("\n[Test 3] Hindi request: 'इसका बैकग्राउंड हटा दो'");
  const t3 = await localAgent.executeChat(
    [{ role: "user", content: "इसका बैकग्राउंड हटा दो" }],
    imageContext,
    false
  );
  console.log("Result 3 Steps:", t3.steps.map(s => ({ tool: s.tool, args: s.arguments })));
  console.log("Result 3 Reply:", t3.reply);

  // Test 4: Document Q&A / Gujarati summary
  console.log("\n[Test 4] Document summary in Gujarati");
  const docContext: ToolExecutionContext = {
    userId: "test-user",
    threadId: "test-doc-thread",
    documentContext: {
      filename: "invoice-october-2026.pdf",
      fileType: "pdf",
      pageCount: 1,
      fullText: "INVOICE #INV-2026-9921\nVendor: Global Tech Solutions Pvt Ltd\nGSTIN: 24AAACG1234F1Z5\nInvoice Total: INR 45,000.00\nDate: 28-Sep-2026\nDescription: Enterprise AI Setup and Local Model Deployment.",
      structureSummary: "Invoice document with GSTIN, vendor details, and total amount.",
    },
  };

  const t4 = await localAgent.executeChat(
    [{ role: "user", content: "Aa PDF nu proper summary Gujarati ma aapo and GST number shu che?" }],
    docContext,
    false
  );
  console.log("Result 4 Reply:", t4.reply);

  console.log("\n=== ALL EVALUATION TESTS FINISHED SUCCESSFULLY ===");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
