package erp.system.assistant.client;

public interface AiClient {

    boolean isConfigured();

    String ask(String systemPrompt, String userMessage);
}
