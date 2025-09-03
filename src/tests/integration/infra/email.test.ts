import email from "infra/email";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.ts", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: "ProjectX <sender@email.com>",
      to: "recipient@email.com",
      subject: "Teste do assunto",
      text: "Teste do corpo do email.",
    });

    await email.send({
      from: "ProjectX <sender@email.com>",
      to: "recipient@email.com",
      subject: "Teste último email",
      text: "Corpo do último email.",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<sender@email.com>");
    expect(lastEmail.recipients[0]).toBe("<recipient@email.com>");
    expect(lastEmail.subject).toBe("Teste último email");
    expect(lastEmail.text).toBe("Corpo do último email.\r\n");
  });
});
