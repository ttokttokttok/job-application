# Create a chat completion

Chat with a language model. This endpoint is consistent with the [OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat) and may be used with the OpenAI JS or Python SDK.

Create a chat completion API{"@context":"http://schema.org","@type":"TechArticle","headline":"Create a chat completion API","description":"Chat with a language model. This endpoint is consistent with the [OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat) and may be used with the OpenAI JS or Python SDK.","url":"https://developers.telnyx.com/api/inference/inference-embedding/chat-public-chat-completions-post","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownCreate a chat completion
POST https://api.telnyx.com/v2/ai/chat/completions
Chat with a language model. This endpoint is consistent with the OpenAI Chat Completions API and may be used with the OpenAI JS or Python SDK.
Request ​
Responses ​200: Successful ResponseSchema Schema422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Request Body
- `messages` (object[]) [required]: A list of the previous chat messages for context.Array []
  - `content` (object) [required]: oneOfContent String Content StringText and Image ArrayArray []
    - `[item]` (string)
    - `type` (string) [required]: *Possible values:* [`text` , `image_url` ]
    - `text` (string)
    - `image_url` (string)
  - `role` (string) [required]: *Possible values:* [`system` , `user` , `assistant` , `tool` ]
- `model` (string): *Default value:* `meta-llama/Meta-Llama-3.1-8B-Instruct` The language model to chat with.
- `api_key_ref` (string): If you are using an external inference provider like xAI or OpenAI, this field allows you to pass along a reference to your API key. After creating an integration secret for you API key, pass the secret's identifier in this field.
- `stream` (boolean): Whether or not to stream data-only server-sent events as they become available.
- `temperature` (number): *Default value:* `0.1` Adjusts the "creativity" of the model. Lower values make the model more deterministic and repetitive, while higher values make the model more random and creative.
- `max_tokens` (integer): Maximum number of completion tokens the model should generate.
- `tools` (object[]) [required]: The `function` tool type follows the same schema as the OpenAI Chat Completions API. The `retrieval` tool type is unique to Telnyx. You may pass a list of embedded storage buckets for retrieval-augmented generation.Array [oneOfFunction FunctionRetrieval]
  - `type` (string) [required]: *Possible values:* [`function` ]
  - `function` (object) [required]
    - `name` (string) [required]
    - `description` (string)
    - `parameters` (object)
      - `property name*` (any)
  - `type` (string) [required]: *Possible values:* [`retrieval` ]
  - `retrieval` (object) [required]
    - `bucket_ids` (string[]) [required]: List of embedded storage buckets to use for retrieval-augmented generation.
    - `max_num_results` (integer): The maximum number of results to retrieve as context for the language model.
- `tool_choice` (string): *Possible values:* [`none` , `auto` , `required` ]
- `response_format` (object) [required]: Use this is you want to guarantee a JSON output without defining a schema. For control over the schema, use `guided_json` .
  - `type` (string) [required]: *Possible values:* [`text` , `json_object` ]
- `guided_json` (object): Must be a valid JSON schema. If specified, the output will follow the JSON schema.
  - `property name*` (any): Must be a valid JSON schema. If specified, the output will follow the JSON schema.
- `guided_regex` (string): If specified, the output will follow the regex pattern.
- `guided_choice` (string[]): If specified, the output will be exactly one of the choices.
- `min_p` (number): This is an alternative to top_p that many prefer. Must be in [0, 1].
- `n` (number): This will return multiple choices for you instead of a single chat completion.
- `use_beam_search` (boolean): Setting this to true will allow the model to explore more completion options. This is not supported by OpenAI.
- `best_of` (integer): This is used with use_beam_search to determine how many candidate beams to explore.
- `length_penalty` (number): *Default value:* `1` This is used with use_beam_search to prefer shorter or longer completions.
- `early_stopping` (boolean): This is used with use_beam_search . If true , generation stops as soon as there are best_of complete candidates; if false , a heuristic is applied and the generation stops when is it very unlikely to find better candidates.
- `logprobs` (boolean): Whether to return log probabilities of the output tokens or not. If true, returns the log probabilities of each output token returned in the content of message .
- `top_logprobs` (integer): This is used with logprobs . An integer between 0 and 20 specifying the number of most likely tokens to return at each token position, each with an associated log probability.
- `frequency_penalty` (number): *Default value:* `0` Higher values will penalize the model from repeating the same output tokens.
- `presence_penalty` (number): *Default value:* `0` Higher values will penalize the model from repeating the same output tokens.
- `top_p` (number): An alternative or complement to temperature . This adjusts how many of the top possibilities to consider.

## Response

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/ai/chat/completions' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "messages": [    {      "role": "system",      "content": "You are a friendly chatbot."    },    {      "role": "user",      "content": "Hello, world!"    }  ]}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/chat/completions' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "messages": [    {      "role": "system",      "content": "You are a friendly chatbot."    },    {      "role": "user",      "content": "Hello, world!"    }  ]}'
```
# Get available models

This endpoint returns a list of Open Source and OpenAI models that are available for use. <br /><br /> **Note**: Model `id`'s will be in the form `{source}/{model_name}`. For example `openai/gpt-4` or `mistralai/Mistral-7B-Instruct-v0.1` consistent with HuggingFace naming conventions.

Get available models API{"@context":"http://schema.org","@type":"TechArticle","headline":"Get available models API","description":"This endpoint returns a list of Open Source and OpenAI models that are available for use. <br /><br /> **Note**: Model `id`'s will be in the form `{source}/{model_name}`. For example `openai/gpt-4` or `mistralai/Mistral-7B-Instruct-v0.1` consistent with HuggingFace naming conventions.","url":"https://developers.telnyx.com/api/inference/inference-embedding/get-models-public-models-get","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownGet available models
GET https://api.telnyx.com/v2/ai/models
This endpoint returns a list of Open Source and OpenAI models that are available for use.
*Note* : Model `id` 's will be in the form `{source}/{model_name}` . For example `openai/gpt-4` or `mistralai/Mistral-7B-Instruct-v0.1` consistent with HuggingFace naming conventions.
Responses ​200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Response

## Response Schema - object
- `object` (Object (string)): *Default value:* `list`
- `data` (object[]) [required]: Array []
  - `id` (Id (string)) [required]
  - `object` (Object (string)): *Default value:* `model`
  - `created` (Created (integer)) [required]
  - `owned_by` (Owned By (string)) [required]

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/ai/models' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```
# Summarize file content

Generate a summary of a file's contents.

Summarize file content API{"@context":"http://schema.org","@type":"TechArticle","headline":"Summarize file content API","description":"Generate a summary of a file's contents.","url":"https://developers.telnyx.com/api/inference/inference-embedding/post-summary","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownSummarize file content
POST https://api.telnyx.com/v2/ai/summarize
Generate a summary of a file's contents.
Supports the following text formats:
PDF, HTML, txt, json, csv
Supports the following media formats (billed for both the transcription and summary):
flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, or webm
Up to 100 MB
Request ​
Responses ​200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Request Body
- `bucket` (string) [required]: The name of the bucket that contains the file to be summarized.
- `filename` (string) [required]: The name of the file to be summarized.
- `system_prompt` (string): A system prompt to guide the summary generation.

## Response

## Response Schema - data
- `data` (object) [required]
  - `summary` (Summary (string)) [required]

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/ai/summarize' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "bucket": "string",  "filename": "string",  "system_prompt": "string"}'
```

# Create an assistant

Create a new AI Assistant.

Create an assistant API{"@context":"http://schema.org","@type":"TechArticle","headline":"Create an assistant API","description":"Create a new AI Assistant.","url":"https://developers.telnyx.com/api/inference/inference-embedding/create-new-assistant-public-assistants-post","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownCreate an assistant
POST https://api.telnyx.com/v2/ai/assistants
Create a new AI Assistant.
Request ​
Responses ​200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Request Body
- `name` (string) [required]
- `model` (string) [required]: ID of the model to use. You can use the Get models API to see all of your available models,
- `instructions` (string) [required]: System instructions for the assistant. These may be templated with dynamic variables
- `tools` (object[]) [required]: The tools that the assistant can use. These may be templated with dynamic variablesArray [oneOfWebhookTool WebhookToolRetrievalToolHandoffToolHangupToolTransferToolSIPReferToolDTMFTool]
  - `type` (string) [required]: *Possible values:* [`webhook` ]
  - `webhook` (object) [required]
    - `name` (string) [required]: The name of the tool.
    - `description` (string) [required]: The description of the tool.
    - `url` (string) [required]: The URL of the external tool to be called. This URL is going to be used by the assistant. The URL can be templated like: https://example.com/api/v1/{id} , where {id} is a placeholder for a value that will be provided by the assistant if path_parameters are provided with the id attribute.
    - `method` (string): *Possible values:* [`GET` , `POST` , `PUT` , `DELETE` , `PATCH` ] *Default value:* `POST` The HTTP method to be used when calling the external tool.
    - `headers` (object[]): The headers to be sent to the external tool.Array []
      - `name` (string)
      - `value` (string): The value of the header. Note that we support mustache templating for the value. For example you can use Bearer {{#integration_secret}}test-secret{{/integration_secret}} to pass the value of the integration secret as the bearer token. Telnyx signature headers will be automatically added to the request.
    - `body_parameters` (object): The body parameters the webhook tool accepts, described as a JSON Schema object. These parameters will be passed to the webhook as the body of the request. See the JSON Schema reference for documentation about the format
      - `properties` (object): The properties of the body parameters.
        - `property name*` (any): The properties of the body parameters.
      - `required` (string[]): The required properties of the body parameters.
      - `type` (string): *Possible values:* [`object` ]
    - `path_parameters` (object): The path parameters the webhook tool accepts, described as a JSON Schema object. These parameters will be passed to the webhook as the path of the request if the URL contains a placeholder for a value. See the JSON Schema reference for documentation about the format
      - `properties` (object): The properties of the path parameters.
        - `property name*` (any): The properties of the path parameters.
      - `required` (string[]): The required properties of the path parameters.
      - `type` (string): *Possible values:* [`object` ]
    - `query_parameters` (object): The query parameters the webhook tool accepts, described as a JSON Schema object. These parameters will be passed to the webhook as the query of the request. See the JSON Schema reference for documentation about the format
      - `properties` (object): The properties of the query parameters.
        - `property name*` (any): The properties of the query parameters.
      - `required` (string[]): The required properties of the query parameters.
      - `type` (string): *Possible values:* [`object` ]
  - `type` (string) [required]: *Possible values:* [`retrieval` ]
  - `retrieval` (object) [required]
    - `bucket_ids` (string[]) [required]: List of embedded storage buckets to use for retrieval-augmented generation.
    - `max_num_results` (integer): The maximum number of results to retrieve as context for the language model.
  - `type` (string) [required]: *Possible values:* [`handoff` ]
  - `handoff` (object) [required]
    - `voice_mode` (string): *Possible values:* [`unified` , `distinct` ]With the unified voice mode all assistants share the same voice, making the handoff transparent to the user. With the distinct voice mode all assistants retain their voice configuration, providing the experience of a conference call with a team of assistants.
    - `ai_assistants` (object[]) [required]: List of possible assistants that can receive a handoff.Array []
      - `name` (string) [required]: Helpful name for giving context on when to handoff to the assistant.
      - `id` (string) [required]: The ID of the assistant to hand off to.
  - `type` (string) [required]: *Possible values:* [`hangup` ]
  - `hangup` (object) [required]
    - `description` (string): *Default value:* `This tool is used to hang up the call.` The description of the function that will be passed to the assistant.
  - `type` (string) [required]: *Possible values:* [`transfer` ]
  - `transfer` (object) [required]
    - `targets` (object[]) [required]: The different possible targets of the transfer. The assistant will be able to choose one of the targets to transfer the call to.Array []
      - `name` (string): The name of the target.
      - `to` (string): The destination number or SIP URI of the call.
    - `from` (string) [required]: Number or SIP URI placing the call.
    - `warm_transfer_instructions` (string): Natural language instructions for your agent for how to provide context for the transfer recipient.
    - `custom_headers` (object[]): Custom headers to be added to the SIP INVITE for the transfer command.Array []
      - `name` (string)
      - `value` (string): The value of the header. Note that we support mustache templating for the value. For example you can use {{#integration_secret}}test-secret{{/integration_secret}} to pass the value of the integration secret.
  - `type` (string) [required]: *Possible values:* [`refer` ]
  - `refer` (object) [required]
    - `targets` (object[]) [required]: The different possible targets of the SIP refer. The assistant will be able to choose one of the targets to refer the call to.Array []
      - `name` (string) [required]: The name of the target.
      - `sip_address` (string) [required]: The SIP URI to which the call will be referred.
      - `sip_auth_username` (string): SIP Authentication username used for SIP challenges.
      - `sip_auth_password` (string): SIP Authentication password used for SIP challenges.
    - `sip_headers` (object[]): SIP headers to be added to the SIP REFER. Currently only User-to-User and Diversion headers are supported.Array []
      - `name` (string): *Possible values:* [`User-to-User` , `Diversion` ]
      - `value` (string): The value of the header. Note that we support mustache templating for the value. For example you can use {{#integration_secret}}test-secret{{/integration_secret}} to pass the value of the integration secret.
    - `custom_headers` (object[]): Custom headers to be added to the SIP REFER.Array []
      - `name` (string)
      - `value` (string): The value of the header. Note that we support mustache templating for the value. For example you can use {{#integration_secret}}test-secret{{/integration_secret}} to pass the value of the integration secret.
  - `type` (string) [required]: *Possible values:* [`send_dtmf` ]
  - `send_dtmf` (object) [required]
    - `property name*` (any)
- `description` (string)
- `greeting` (string): Text that the assistant will use to start the conversation. This may be templated with dynamic variables
- `llm_api_key_ref` (string): This is only needed when using third-party inference providers. The identifier for an integration secret /v2/integration_secrets that refers to your LLM provider's API key. Warning: Free plans are unlikely to work with this integration.
- `voice_settings` (object) [required]
  - `voice` (string) [required]: The voice to be used by the voice assistant. Check the full list of available voices via our voices API. To use ElevenLabs, you must reference your ElevenLabs API key as an integration secret under the api_key_ref field. See integration secrets documentation for details. For Telnyx voices, use Telnyx.<model_id>.<voice_id> (e.g. Telnyx.KokoroTTS.af_heart)
  - `voice_speed` (number): *Default value:* `1` The speed of the voice in the range [0.25, 2.0]. 1.0 is deafult speed. Larger numbers make the voice faster, smaller numbers make it slower. This is only applicable for Telnyx Natural voices.
  - `api_key_ref` (string): The identifier for an integration secret /v2/integration_secrets that refers to your ElevenLabs API key. Warning: Free plans are unlikely to work with this integration.
  - `background_audio` (object) [required]: Optional background audio to play on the call. Use a predefined media bed, or supply a looped MP3 URL. If a media URL is chosen in the portal, customers can preview it before saving.oneOfobject objectobjectobject
    - `type` (string) [required]: *Possible values:* [`predefined_media` ]Select from predefined media options.
    - `value` (string) [required]: *Possible values:* [`silence` , `office` ] *Default value:* `silence` The predefined media to use. silence disables background audio.
    - `type` (string) [required]: *Possible values:* [`media_url` ]Provide a direct URL to an MP3 file. The audio will loop during the call.
    - `value` (string<uri>) [required]: HTTPS URL to an MP3 file.
    - `type` (string) [required]: *Possible values:* [`media_name` ]Reference a previously uploaded media by its name from Telnyx Media Storage.
    - `value` (string) [required]: The name of a media asset created via Media Storage API. The audio will loop during the call.
- `transcription` (object)
  - `model` (string): *Possible values:* [`deepgram/flux` , `deepgram/nova-3` , `deepgram/nova-2` , `azure/fast` , `distil-whisper/distil-large-v2` , `openai/whisper-large-v3-turbo` ]The speech to text model to be used by the voice assistant. All the deepgram models are run on-premise. deepgram/flux is optimized for turn-taking but is English-only. deepgram/nova-3 is multi-lingual with automatic language detection but slightly higher latency.
  - `language` (string): The language of the audio to be transcribed. If not set, of if set to auto , the model will automatically detect the language.
  - `region` (Region (string)): Region on third party cloud providers (currently Azure) if using one of their models
  - `settings` (object)
    - `smart_format` (Smart Format (boolean))
    - `numerals` (Numerals (boolean))
    - `eot_threshold` (Eot Threshold (number)): Available only for deepgram/flux. Confidence required to trigger an end of turn. Higher values = more reliable turn detection but slightly increased latency.
    - `eot_timeout_ms` (Eot Timeout Ms (integer)): Available only for deepgram/flux. Maximum milliseconds of silence before forcing an end of turn, regardless of confidence.
- `telephony_settings` (object)
  - `default_texml_app_id` (string): Default Texml App used for voice calls with your assistant. This will be created automatically on assistant creation.
  - `supports_unauthenticated_web_calls` (boolean): When enabled, allows users to interact with your AI assistant directly from your website without requiring authentication. This is required for FE widgets that work with assistants that have telephony enabled.
- `messaging_settings` (object)
  - `default_messaging_profile_id` (string): Default Messaging Profile used for messaging exchanges with your assistant. This will be created automatically on assistant creation.
  - `delivery_status_webhook_url` (string): The URL where webhooks related to delivery statused for assistant messages will be sent.
- `enabled_features` (EnabledFeatures (string)[]): *Possible values:* [`telephony` , `messaging` ]
- `insight_settings` (object)
  - `insight_group_id` (string): Reference to an Insight Group. Insights in this group will be run automatically for all the assistant's conversations.
- `privacy_settings` (object)
  - `data_retention` (boolean): If true, conversation history and insights will be stored. If false, they will not be stored. This in‑tool toggle governs solely the retention of conversation history and insights via the AI assistant. It has no effect on any separate recording, transcription, or storage configuration that you have set at the account, number, or application level. All such external settings remain in force regardless of your selection here.
- `dynamic_variables_webhook_url` (string): If the dynamic_variables_webhook_url is set for the assistant, we will send a request at the start of the conversation. See our guide for more information.
- `dynamic_variables` (object): Map of dynamic variables and their default values
  - `property name*` (any): Map of dynamic variables and their default values

## Response

## Response Schema - id
- `id` (string) [required]
- `name` (string) [required]
- `created_at` (string<date-time>) [required]
- `description` (string)
- `model` (string) [required]: ID of the model to use. You can use the Get models API to see all of your available models,
- `instructions` (string) [required]: System instructions for the assistant. These may be templated with dynamic variables
- `tools` (object[]) [required]: The tools that the assistant can use. These may be templated with dynamic variablesArray [oneOfWebhookTool WebhookToolRetrievalToolHandoffToolHangupToolTransferToolSIPReferToolDTMFTool]
  - `type` (string) [required]: *Possible values:* [`webhook` ]
  - `webhook` (object) [required]
    - `name` (string) [required]: The name of the tool.
    - `description` (string) [required]: The description of the tool.
    - `url` (string) [required]: The URL of the external tool to be called. This URL is going to be used by the assistant. The URL can be templated like: https://example.com/api/v1/{id} , where {id} is a placeholder for a value that will be provided by the assistant if path_parameters are provided with the id attribute.
    - `method` (string): *Possible values:* [`GET` , `POST` , `PUT` , `DELETE` , `PATCH` ] *Default value:* `POST` The HTTP method to be used when calling the external tool.
    - `headers` (object[]): The headers to be sent to the external tool.Array []
      - `name` (string)
      - `value` (string): The value of the header. Note that we support mustache templating for the value. For example you can use Bearer {{#integration_secret}}test-secret{{/integration_secret}} to pass the value of the integration secret as the bearer token. Telnyx signature headers will be automatically added to the request.
    - `body_parameters` (object): The body parameters the webhook tool accepts, described as a JSON Schema object. These parameters will be passed to the webhook as the body of the request. See the JSON Schema reference for documentation about the format
      - `properties` (object): The properties of the body parameters.
        - `property name*` (any): The properties of the body parameters.
      - `required` (string[]): The required properties of the body parameters.
      - `type` (string): *Possible values:* [`object` ]
    - `path_parameters` (object): The path parameters the webhook tool accepts, described as a JSON Schema object. These parameters will be passed to the webhook as the path of the request if the URL contains a placeholder for a value. See the JSON Schema reference for documentation about the format
      - `properties` (object): The properties of the path parameters.
        - `property name*` (any): The properties of the path parameters.
      - `required` (string[]): The required properties of the path parameters.
      - `type` (string): *Possible values:* [`object` ]
    - `query_parameters` (object): The query parameters the webhook tool accepts, described as a JSON Schema object. These parameters will be passed to the webhook as the query of the request. See the JSON Schema reference for documentation about the format
      - `properties` (object): The properties of the query parameters.
        - `property name*` (any): The properties of the query parameters.
      - `required` (string[]): The required properties of the query parameters.
      - `type` (string): *Possible values:* [`object` ]
  - `type` (string) [required]: *Possible values:* [`retrieval` ]
  - `retrieval` (object) [required]
    - `bucket_ids` (string[]) [required]: List of embedded storage buckets to use for retrieval-augmented generation.
    - `max_num_results` (integer): The maximum number of results to retrieve as context for the language model.
  - `type` (string) [required]: *Possible values:* [`handoff` ]
  - `handoff` (object) [required]
    - `voice_mode` (string): *Possible values:* [`unified` , `distinct` ]With the unified voice mode all assistants share the same voice, making the handoff transparent to the user. With the distinct voice mode all assistants retain their voice configuration, providing the experience of a conference call with a team of assistants.
    - `ai_assistants` (object[]) [required]: List of possible assistants that can receive a handoff.Array []
      - `name` (string) [required]: Helpful name for giving context on when to handoff to the assistant.
      - `id` (string) [required]: The ID of the assistant to hand off to.
  - `type` (string) [required]: *Possible values:* [`hangup` ]
  - `hangup` (object) [required]
    - `description` (string): *Default value:* `This tool is used to hang up the call.` The description of the function that will be passed to the assistant.
  - `type` (string) [required]: *Possible values:* [`transfer` ]
  - `transfer` (object) [required]
    - `targets` (object[]) [required]: The different possible targets of the transfer. The assistant will be able to choose one of the targets to transfer the call to.Array []
      - `name` (string): The name of the target.
      - `to` (string): The destination number or SIP URI of the call.
    - `from` (string) [required]: Number or SIP URI placing the call.
    - `warm_transfer_instructions` (string): Natural language instructions for your agent for how to provide context for the transfer recipient.
    - `custom_headers` (object[]): Custom headers to be added to the SIP INVITE for the transfer command.Array []
      - `name` (string)
      - `value` (string): The value of the header. Note that we support mustache templating for the value. For example you can use {{#integration_secret}}test-secret{{/integration_secret}} to pass the value of the integration secret.
  - `type` (string) [required]: *Possible values:* [`refer` ]
  - `refer` (object) [required]
    - `targets` (object[]) [required]: The different possible targets of the SIP refer. The assistant will be able to choose one of the targets to refer the call to.Array []
      - `name` (string) [required]: The name of the target.
      - `sip_address` (string) [required]: The SIP URI to which the call will be referred.
      - `sip_auth_username` (string): SIP Authentication username used for SIP challenges.
      - `sip_auth_password` (string): SIP Authentication password used for SIP challenges.
    - `sip_headers` (object[]): SIP headers to be added to the SIP REFER. Currently only User-to-User and Diversion headers are supported.Array []
      - `name` (string): *Possible values:* [`User-to-User` , `Diversion` ]
      - `value` (string): The value of the header. Note that we support mustache templating for the value. For example you can use {{#integration_secret}}test-secret{{/integration_secret}} to pass the value of the integration secret.
    - `custom_headers` (object[]): Custom headers to be added to the SIP REFER.Array []
      - `name` (string)
      - `value` (string): The value of the header. Note that we support mustache templating for the value. For example you can use {{#integration_secret}}test-secret{{/integration_secret}} to pass the value of the integration secret.
  - `type` (string) [required]: *Possible values:* [`send_dtmf` ]
  - `send_dtmf` (object) [required]
    - `property name*` (any)
- `greeting` (string): Text that the assistant will use to start the conversation. This may be templated with dynamic variables
- `llm_api_key_ref` (string): This is only needed when using third-party inference providers. The identifier for an integration secret /v2/integration_secrets that refers to your LLM provider's API key. Warning: Free plans are unlikely to work with this integration.
- `voice_settings` (object) [required]
  - `voice` (string) [required]: The voice to be used by the voice assistant. Check the full list of available voices via our voices API. To use ElevenLabs, you must reference your ElevenLabs API key as an integration secret under the api_key_ref field. See integration secrets documentation for details. For Telnyx voices, use Telnyx.<model_id>.<voice_id> (e.g. Telnyx.KokoroTTS.af_heart)
  - `voice_speed` (number): *Default value:* `1` The speed of the voice in the range [0.25, 2.0]. 1.0 is deafult speed. Larger numbers make the voice faster, smaller numbers make it slower. This is only applicable for Telnyx Natural voices.
  - `api_key_ref` (string): The identifier for an integration secret /v2/integration_secrets that refers to your ElevenLabs API key. Warning: Free plans are unlikely to work with this integration.
  - `background_audio` (object) [required]: Optional background audio to play on the call. Use a predefined media bed, or supply a looped MP3 URL. If a media URL is chosen in the portal, customers can preview it before saving.oneOfobject objectobjectobject
    - `type` (string) [required]: *Possible values:* [`predefined_media` ]Select from predefined media options.
    - `value` (string) [required]: *Possible values:* [`silence` , `office` ] *Default value:* `silence` The predefined media to use. silence disables background audio.
    - `type` (string) [required]: *Possible values:* [`media_url` ]Provide a direct URL to an MP3 file. The audio will loop during the call.
    - `value` (string<uri>) [required]: HTTPS URL to an MP3 file.
    - `type` (string) [required]: *Possible values:* [`media_name` ]Reference a previously uploaded media by its name from Telnyx Media Storage.
    - `value` (string) [required]: The name of a media asset created via Media Storage API. The audio will loop during the call.
- `transcription` (object)
  - `model` (string): *Possible values:* [`deepgram/flux` , `deepgram/nova-3` , `deepgram/nova-2` , `azure/fast` , `distil-whisper/distil-large-v2` , `openai/whisper-large-v3-turbo` ]The speech to text model to be used by the voice assistant. All the deepgram models are run on-premise. deepgram/flux is optimized for turn-taking but is English-only. deepgram/nova-3 is multi-lingual with automatic language detection but slightly higher latency.
  - `language` (string): The language of the audio to be transcribed. If not set, of if set to auto , the model will automatically detect the language.
  - `region` (Region (string)): Region on third party cloud providers (currently Azure) if using one of their models
  - `settings` (object)
    - `smart_format` (Smart Format (boolean))
    - `numerals` (Numerals (boolean))
    - `eot_threshold` (Eot Threshold (number)): Available only for deepgram/flux. Confidence required to trigger an end of turn. Higher values = more reliable turn detection but slightly increased latency.
    - `eot_timeout_ms` (Eot Timeout Ms (integer)): Available only for deepgram/flux. Maximum milliseconds of silence before forcing an end of turn, regardless of confidence.
- `telephony_settings` (object)
  - `default_texml_app_id` (string): Default Texml App used for voice calls with your assistant. This will be created automatically on assistant creation.
  - `supports_unauthenticated_web_calls` (boolean): When enabled, allows users to interact with your AI assistant directly from your website without requiring authentication. This is required for FE widgets that work with assistants that have telephony enabled.
- `messaging_settings` (object)
  - `default_messaging_profile_id` (string): Default Messaging Profile used for messaging exchanges with your assistant. This will be created automatically on assistant creation.
  - `delivery_status_webhook_url` (string): The URL where webhooks related to delivery statused for assistant messages will be sent.
- `enabled_features` (EnabledFeatures (string)[]): *Possible values:* [`telephony` , `messaging` ]
- `insight_settings` (object)
  - `insight_group_id` (string): Reference to an Insight Group. Insights in this group will be run automatically for all the assistant's conversations.
- `privacy_settings` (object)
  - `data_retention` (boolean): If true, conversation history and insights will be stored. If false, they will not be stored. This in‑tool toggle governs solely the retention of conversation history and insights via the AI assistant. It has no effect on any separate recording, transcription, or storage configuration that you have set at the account, number, or application level. All such external settings remain in force regardless of your selection here.
- `dynamic_variables_webhook_url` (string): If the dynamic_variables_webhook_url is set for the assistant, we will send a request at the start of the conversation. See our guide for more information.
- `dynamic_variables` (object): Map of dynamic variables and their values
  - `property name*` (any): Map of dynamic variables and their values
- `import_metadata` (object)
  - `import_provider` (string): *Possible values:* [`elevenlabs` , `vapi` , `retell` ]Provider the assistant was imported from.
  - `import_id` (string): ID of the assistant in the provider's system.

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/ai/assistants' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "name": "string",  "model": "string",  "instructions": "string",  "tools": [    {      "type": "webhook",      "webhook": {        "name": "string",        "description": "string",        "url": "https://example.com/api/v1/function",        "method": "POST",        "headers": [          {            "name": "string",            "value": "string"          }        ],        "body_parameters": {          "properties": {            "age": {              "description": "The age of the customer.",              "type": "integer"            },            "location": {              "description": "The location of the customer.",              "type": "string"            }          },          "required": [            "age",            "location"          ],          "type": "object"        },        "path_parameters": {          "properties": {            "id": {              "description": "The id of the customer.",              "type": "string"            }          },          "required": [            "id"          ],          "type": "object"        },        "query_parameters": {          "properties": {            "page": {              "description": "The page number.",              "type": "integer"            }          },          "required": [            "page"          ],          "type": "object"        }      }    },    {      "type": "retrieval",      "retrieval": {        "bucket_ids": [          "string"        ],        "max_num_results": 0      }    },    {      "type": "handoff",      "handoff": {        "voice_mode": "unified",        "ai_assistants": [          {            "name": "Scheduling Specialist",            "id": "assistant-1234567890abcdef"          }        ]      }    },    {      "type": "hangup",      "hangup": {        "description": "This tool is used to hang up the call."      }    },    {      "type": "transfer",      "transfer": {        "targets": [          {            "name": "Support",            "to": "+13129457420"          }        ],        "from": "+35319605860",        "warm_transfer_instructions": "Briefly greet the transfer recipient and provide any relevant information from the call. Let them know you will bridge the call right after.",        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "refer",      "refer": {        "targets": [          {            "name": "Support",            "sip_address": "sip:username@sip.non-telnyx-address.com",            "sip_auth_username": "string",            "sip_auth_password": "string"          }        ],        "sip_headers": [          {            "name": "User-to-User",            "value": "string"          }        ],        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "send_dtmf",      "send_dtmf": {}    }  ],  "description": "string",  "greeting": "string",  "llm_api_key_ref": "string",  "voice_settings": {    "voice": "string",    "voice_speed": 1,    "api_key_ref": "string",    "background_audio": {      "type": "predefined_media",      "value": "silence"    }  },  "transcription": {    "model": "deepgram/flux",    "language": "string",    "region": "string",    "settings": {      "smart_format": true,      "numerals": true,      "eot_threshold": 0,      "eot_timeout_ms": 0    }  },  "telephony_settings": {    "default_texml_app_id": "string",    "supports_unauthenticated_web_calls": true  },  "messaging_settings": {    "default_messaging_profile_id": "string",    "delivery_status_webhook_url": "string"  },  "enabled_features": [    "telephony"  ],  "insight_settings": {    "insight_group_id": "string"  },  "privacy_settings": {    "data_retention": true  },  "dynamic_variables_webhook_url": "string",  "dynamic_variables": {}}'
```
# List assistants

Retrieve a list of all AI Assistants configured by the user.

List assistants API{"@context":"http://schema.org","@type":"TechArticle","headline":"List assistants API","description":"Retrieve a list of all AI Assistants configured by the user.","url":"https://developers.telnyx.com/api/inference/inference-embedding/get-assistants-public-assistants-get","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownList assistants
GET https://api.telnyx.com/v2/ai/assistants
Retrieve a list of all AI Assistants configured by the user.
Responses â€‹200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint
## Response Schema - data
- `data` (object[]) [required]: Array []
  - `id` (string) [required]
  - `name` (string) [required]
  - `created_at` (string<date-time>) [required]
  - `description` (string)
  - `model` (string) [required]: ID of the model to use. You can use the Get models API to see all of your available models,
  - `instructions` (string) [required]: System instructions for the assistant. These may be templated with dynamic variables
  - `tools` (object[]) [required]: The tools that the assistant can use. These may be templated with dynamic variablesArray [oneOfWebhookTool WebhookToolRetrievalToolHandoffToolHangupToolTransferToolSIPReferToolDTMFTool]
    - `type` (string) [required]: *Possible values:* [`webhook` ]
    - `webhook` (object) [required]
      - `name` (string) [required]: The name of the tool.
      - `description` (string) [required]: The description of the tool.
      - `url` (string) [required]: The URL of the external tool to be called. This URL is going to be used by the assistant. The URL can be templated like: https://example.com/api/v1/{id} , where {id} is a placeholder for a value that will be provided by the assistant if path_parameters are provided with the id attribute.
      - `method` (string): *Possible values:* [`GET` , `POST` , `PUT` , `DELETE` , `PATCH` ] *Default value:* `POST` The HTTP method to be used when calling the external tool.
      - `headers` (object[]): The headers to be sent to the external tool.Array []
        - `name` (string)
        - `value` (string): The value of the header. Note that we support mustache templating for the value. For example you can use Bearer {{#integration_secret}}test-secret{{/integration_secret}} to pass the value of the integration secret as the bearer token. Telnyx signature headers will be automatically added to the request.
      - `body_parameters` (object): The body parameters the webhook tool accepts, described as a JSON Schema object. These parameters will be passed to the webhook as the body of the request. See the JSON Schema reference for documentation about the format
        - `properties` (object): The properties of the body parameters.
          - `property name*` (any): The properties of the body parameters.
        - `required` (string[]): The required properties of the body parameters.
        - `type` (string): *Possible values:* [`object` ]
      - `path_parameters` (object): The path parameters the webhook tool accepts, described as a JSON Schema object. These parameters will be passed to the webhook as the path of the request if the URL contains a placeholder for a value. See the JSON Schema reference for documentation about the format
        - `properties` (object): The properties of the path parameters.
          - `property name*` (any): The properties of the path parameters.
        - `required` (string[]): The required properties of the path parameters.
        - `type` (string): *Possible values:* [`object` ]
      - `query_parameters` (object): The query parameters the webhook tool accepts, described as a JSON Schema object. These parameters will be passed to the webhook as the query of the request. See the JSON Schema reference for documentation about the format
        - `properties` (object): The properties of the query parameters.
          - `property name*` (any): The properties of the query parameters.
        - `required` (string[]): The required properties of the query parameters.
        - `type` (string): *Possible values:* [`object` ]
    - `type` (string) [required]: *Possible values:* [`retrieval` ]
    - `retrieval` (object) [required]
      - `bucket_ids` (string[]) [required]: List of embedded storage buckets to use for retrieval-augmented generation.
      - `max_num_results` (integer): The maximum number of results to retrieve as context for the language model.
    - `type` (string) [required]: *Possible values:* [`handoff` ]
    - `handoff` (object) [required]
      - `voice_mode` (string): *Possible values:* [`unified` , `distinct` ]With the unified voice mode all assistants share the same voice, making the handoff transparent to the user. With the distinct voice mode all assistants retain their voice configuration, providing the experience of a conference call with a team of assistants.
      - `ai_assistants` (object[]) [required]: List of possible assistants that can receive a handoff.Array []
        - `name` (string) [required]: Helpful name for giving context on when to handoff to the assistant.
        - `id` (string) [required]: The ID of the assistant to hand off to.
    - `type` (string) [required]: *Possible values:* [`hangup` ]
    - `hangup` (object) [required]
      - `description` (string): *Default value:* `This tool is used to hang up the call.` The description of the function that will be passed to the assistant.
    - `type` (string) [required]: *Possible values:* [`transfer` ]
    - `transfer` (object) [required]
      - `targets` (object[]) [required]: The different possible targets of the transfer. The assistant will be able to choose one of the targets to transfer the call to.Array []
        - `name` (string): The name of the target.
        - `to` (string): The destination number or SIP URI of the call.
      - `from` (string) [required]: Number or SIP URI placing the call.
      - `warm_transfer_instructions` (string): Natural language instructions for your agent for how to provide context for the transfer recipient.
      - `custom_headers` (object[]): Custom headers to be added to the SIP INVITE for the transfer command.Array []
        - `name` (string)
        - `value` (string): The value of the header. Note that we support mustache templating for the value. For example you can use {{#integration_secret}}test-secret{{/integration_secret}} to pass the value of the integration secret.
    - `type` (string) [required]: *Possible values:* [`refer` ]
    - `refer` (object) [required]
      - `targets` (object[]) [required]: The different possible targets of the SIP refer. The assistant will be able to choose one of the targets to refer the call to.Array []
        - `name` (string) [required]: The name of the target.
        - `sip_address` (string) [required]: The SIP URI to which the call will be referred.
        - `sip_auth_username` (string): SIP Authentication username used for SIP challenges.
        - `sip_auth_password` (string): SIP Authentication password used for SIP challenges.
      - `sip_headers` (object[]): SIP headers to be added to the SIP REFER. Currently only User-to-User and Diversion headers are supported.Array []
        - `name` (string): *Possible values:* [`User-to-User` , `Diversion` ]
        - `value` (string): The value of the header. Note that we support mustache templating for the value. For example you can use {{#integration_secret}}test-secret{{/integration_secret}} to pass the value of the integration secret.
      - `custom_headers` (object[]): Custom headers to be added to the SIP REFER.Array []
        - `name` (string)
        - `value` (string): The value of the header. Note that we support mustache templating for the value. For example you can use {{#integration_secret}}test-secret{{/integration_secret}} to pass the value of the integration secret.
    - `type` (string) [required]: *Possible values:* [`send_dtmf` ]
    - `send_dtmf` (object) [required]
      - `property name*` (any)
  - `greeting` (string): Text that the assistant will use to start the conversation. This may be templated with dynamic variables
  - `llm_api_key_ref` (string): This is only needed when using third-party inference providers. The identifier for an integration secret /v2/integration_secrets that refers to your LLM provider's API key. Warning: Free plans are unlikely to work with this integration.
  - `voice_settings` (object) [required]
    - `voice` (string) [required]: The voice to be used by the voice assistant. Check the full list of available voices via our voices API. To use ElevenLabs, you must reference your ElevenLabs API key as an integration secret under the api_key_ref field. See integration secrets documentation for details. For Telnyx voices, use Telnyx.<model_id>.<voice_id> (e.g. Telnyx.KokoroTTS.af_heart)
    - `voice_speed` (number): *Default value:* `1` The speed of the voice in the range [0.25, 2.0]. 1.0 is deafult speed. Larger numbers make the voice faster, smaller numbers make it slower. This is only applicable for Telnyx Natural voices.
    - `api_key_ref` (string): The identifier for an integration secret /v2/integration_secrets that refers to your ElevenLabs API key. Warning: Free plans are unlikely to work with this integration.
    - `background_audio` (object) [required]: Optional background audio to play on the call. Use a predefined media bed, or supply a looped MP3 URL. If a media URL is chosen in the portal, customers can preview it before saving.oneOfobject objectobjectobject
      - `type` (string) [required]: *Possible values:* [`predefined_media` ]Select from predefined media options.
      - `value` (string) [required]: *Possible values:* [`silence` , `office` ] *Default value:* `silence` The predefined media to use. silence disables background audio.
      - `type` (string) [required]: *Possible values:* [`media_url` ]Provide a direct URL to an MP3 file. The audio will loop during the call.
      - `value` (string<uri>) [required]: HTTPS URL to an MP3 file.
      - `type` (string) [required]: *Possible values:* [`media_name` ]Reference a previously uploaded media by its name from Telnyx Media Storage.
      - `value` (string) [required]: The name of a media asset created via Media Storage API. The audio will loop during the call.
  - `transcription` (object)
    - `model` (string): *Possible values:* [`deepgram/flux` , `deepgram/nova-3` , `deepgram/nova-2` , `azure/fast` , `distil-whisper/distil-large-v2` , `openai/whisper-large-v3-turbo` ]The speech to text model to be used by the voice assistant. All the deepgram models are run on-premise. deepgram/flux is optimized for turn-taking but is English-only. deepgram/nova-3 is multi-lingual with automatic language detection but slightly higher latency.
    - `language` (string): The language of the audio to be transcribed. If not set, of if set to auto , the model will automatically detect the language.
    - `region` (Region (string)): Region on third party cloud providers (currently Azure) if using one of their models
    - `settings` (object)
      - `smart_format` (Smart Format (boolean))
      - `numerals` (Numerals (boolean))
      - `eot_threshold` (Eot Threshold (number)): Available only for deepgram/flux. Confidence required to trigger an end of turn. Higher values = more reliable turn detection but slightly increased latency.
      - `eot_timeout_ms` (Eot Timeout Ms (integer)): Available only for deepgram/flux. Maximum milliseconds of silence before forcing an end of turn, regardless of confidence.
  - `telephony_settings` (object)
    - `default_texml_app_id` (string): Default Texml App used for voice calls with your assistant. This will be created automatically on assistant creation.
    - `supports_unauthenticated_web_calls` (boolean): When enabled, allows users to interact with your AI assistant directly from your website without requiring authentication. This is required for FE widgets that work with assistants that have telephony enabled.
  - `messaging_settings` (object)
    - `default_messaging_profile_id` (string): Default Messaging Profile used for messaging exchanges with your assistant. This will be created automatically on assistant creation.
    - `delivery_status_webhook_url` (string): The URL where webhooks related to delivery statused for assistant messages will be sent.
  - `enabled_features` (EnabledFeatures (string)[]): *Possible values:* [`telephony` , `messaging` ]
  - `insight_settings` (object)
    - `insight_group_id` (string): Reference to an Insight Group. Insights in this group will be run automatically for all the assistant's conversations.
  - `privacy_settings` (object)
    - `data_retention` (boolean): If true, conversation history and insights will be stored. If false, they will not be stored. This inâ€‘tool toggle governs solely the retention of conversation history and insights via the AI assistant. It has no effect on any separate recording, transcription, or storage configuration that you have set at the account, number, or application level. All such external settings remain in force regardless of your selection here.
  - `dynamic_variables_webhook_url` (string): If the dynamic_variables_webhook_url is set for the assistant, we will send a request at the start of the conversation. See our guide for more information.
  - `dynamic_variables` (object): Map of dynamic variables and their values
    - `property name*` (any): Map of dynamic variables and their values
  - `import_metadata` (object)
    - `import_provider` (string): *Possible values:* [`elevenlabs` , `vapi` , `retell` ]Provider the assistant was imported from.
    - `import_id` (string): ID of the assistant in the provider's system.

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

# Import assistants from external provider

Import assistants from external providers. Any assistant that has already been imported will be overwritten with its latest version from the importing provider.

Import assistants from external provider API{"@context":"http://schema.org","@type":"TechArticle","headline":"Import assistants from external provider API","description":"Import assistants from external providers. Any assistant that has already been imported will be overwritten with its latest version from the importing provider.","url":"https://developers.telnyx.com/api/inference/inference-embedding/import-assistants-public-assistants-import-post","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownImport assistants from external provider
POST https://api.telnyx.com/v2/ai/assistants/import
Import assistants from external providers. Any assistant that has already been imported will be overwritten with its latest version from the importing provider.
Request ​
Responses ​200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Request Body
- `provider` (string) [required]: *Possible values:* [`elevenlabs` , `vapi` , `retell` ]The external provider to import assistants from.
- `api_key_ref` (string) [required]: Integration secret pointer that refers to the API key for the external provider. This should be an identifier for an integration secret created via /v2/integration_secrets.

## Response

## Response Schema - data
- `data` (object[]) [required]: Array []
  - `id` (string) [required]
  - `name` (string) [required]
  - `created_at` (string<date-time>) [required]
  - `description` (string)
  - `model` (string) [required]: ID of the model to use. You can use the Get models API to see all of your available models,
  - `instructions` (string) [required]: System instructions for the assistant. These may be templated with dynamic variables
  - `tools` (object[]) [required]: The tools that the assistant can use. These may be templated with dynamic variablesArray [oneOfWebhookTool WebhookToolRetrievalToolHandoffToolHangupToolTransferToolSIPReferToolDTMFTool]
    - `type` (string) [required]: *Possible values:* [`webhook` ]
    - `webhook` (object) [required]
      - `name` (string) [required]: The name of the tool.
      - `description` (string) [required]: The description of the tool.
      - `url` (string) [required]: The URL of the external tool to be called. This URL is going to be used by the assistant. The URL can be templated like: https://example.com/api/v1/{id} , where {id} is a placeholder for a value that will be provided by the assistant if path_parameters are provided with the id attribute.
      - `method` (string): *Possible values:* [`GET` , `POST` , `PUT` , `DELETE` , `PATCH` ] *Default value:* `POST` The HTTP method to be used when calling the external tool.
      - `headers` (object[]): The headers to be sent to the external tool.Array []
        - `name` (string)
        - `value` (string): The value of the header. Note that we support mustache templating for the value. For example you can use Bearer {{#integration_secret}}test-secret{{/integration_secret}} to pass the value of the integration secret as the bearer token. Telnyx signature headers will be automatically added to the request.
      - `body_parameters` (object): The body parameters the webhook tool accepts, described as a JSON Schema object. These parameters will be passed to the webhook as the body of the request. See the JSON Schema reference for documentation about the format
        - `properties` (object): The properties of the body parameters.
          - `property name*` (any): The properties of the body parameters.
        - `required` (string[]): The required properties of the body parameters.
        - `type` (string): *Possible values:* [`object` ]
      - `path_parameters` (object): The path parameters the webhook tool accepts, described as a JSON Schema object. These parameters will be passed to the webhook as the path of the request if the URL contains a placeholder for a value. See the JSON Schema reference for documentation about the format
        - `properties` (object): The properties of the path parameters.
          - `property name*` (any): The properties of the path parameters.
        - `required` (string[]): The required properties of the path parameters.
        - `type` (string): *Possible values:* [`object` ]
      - `query_parameters` (object): The query parameters the webhook tool accepts, described as a JSON Schema object. These parameters will be passed to the webhook as the query of the request. See the JSON Schema reference for documentation about the format
        - `properties` (object): The properties of the query parameters.
          - `property name*` (any): The properties of the query parameters.
        - `required` (string[]): The required properties of the query parameters.
        - `type` (string): *Possible values:* [`object` ]
    - `type` (string) [required]: *Possible values:* [`retrieval` ]
    - `retrieval` (object) [required]
      - `bucket_ids` (string[]) [required]: List of embedded storage buckets to use for retrieval-augmented generation.
      - `max_num_results` (integer): The maximum number of results to retrieve as context for the language model.
    - `type` (string) [required]: *Possible values:* [`handoff` ]
    - `handoff` (object) [required]
      - `voice_mode` (string): *Possible values:* [`unified` , `distinct` ]With the unified voice mode all assistants share the same voice, making the handoff transparent to the user. With the distinct voice mode all assistants retain their voice configuration, providing the experience of a conference call with a team of assistants.
      - `ai_assistants` (object[]) [required]: List of possible assistants that can receive a handoff.Array []
        - `name` (string) [required]: Helpful name for giving context on when to handoff to the assistant.
        - `id` (string) [required]: The ID of the assistant to hand off to.
    - `type` (string) [required]: *Possible values:* [`hangup` ]
    - `hangup` (object) [required]
      - `description` (string): *Default value:* `This tool is used to hang up the call.` The description of the function that will be passed to the assistant.
    - `type` (string) [required]: *Possible values:* [`transfer` ]
    - `transfer` (object) [required]
      - `targets` (object[]) [required]: The different possible targets of the transfer. The assistant will be able to choose one of the targets to transfer the call to.Array []
        - `name` (string): The name of the target.
        - `to` (string): The destination number or SIP URI of the call.
      - `from` (string) [required]: Number or SIP URI placing the call.
      - `warm_transfer_instructions` (string): Natural language instructions for your agent for how to provide context for the transfer recipient.
      - `custom_headers` (object[]): Custom headers to be added to the SIP INVITE for the transfer command.Array []
        - `name` (string)
        - `value` (string): The value of the header. Note that we support mustache templating for the value. For example you can use {{#integration_secret}}test-secret{{/integration_secret}} to pass the value of the integration secret.
    - `type` (string) [required]: *Possible values:* [`refer` ]
    - `refer` (object) [required]
      - `targets` (object[]) [required]: The different possible targets of the SIP refer. The assistant will be able to choose one of the targets to refer the call to.Array []
        - `name` (string) [required]: The name of the target.
        - `sip_address` (string) [required]: The SIP URI to which the call will be referred.
        - `sip_auth_username` (string): SIP Authentication username used for SIP challenges.
        - `sip_auth_password` (string): SIP Authentication password used for SIP challenges.
      - `sip_headers` (object[]): SIP headers to be added to the SIP REFER. Currently only User-to-User and Diversion headers are supported.Array []
        - `name` (string): *Possible values:* [`User-to-User` , `Diversion` ]
        - `value` (string): The value of the header. Note that we support mustache templating for the value. For example you can use {{#integration_secret}}test-secret{{/integration_secret}} to pass the value of the integration secret.
      - `custom_headers` (object[]): Custom headers to be added to the SIP REFER.Array []
        - `name` (string)
        - `value` (string): The value of the header. Note that we support mustache templating for the value. For example you can use {{#integration_secret}}test-secret{{/integration_secret}} to pass the value of the integration secret.
    - `type` (string) [required]: *Possible values:* [`send_dtmf` ]
    - `send_dtmf` (object) [required]
      - `property name*` (any)
  - `greeting` (string): Text that the assistant will use to start the conversation. This may be templated with dynamic variables
  - `llm_api_key_ref` (string): This is only needed when using third-party inference providers. The identifier for an integration secret /v2/integration_secrets that refers to your LLM provider's API key. Warning: Free plans are unlikely to work with this integration.
  - `voice_settings` (object) [required]
    - `voice` (string) [required]: The voice to be used by the voice assistant. Check the full list of available voices via our voices API. To use ElevenLabs, you must reference your ElevenLabs API key as an integration secret under the api_key_ref field. See integration secrets documentation for details. For Telnyx voices, use Telnyx.<model_id>.<voice_id> (e.g. Telnyx.KokoroTTS.af_heart)
    - `voice_speed` (number): *Default value:* `1` The speed of the voice in the range [0.25, 2.0]. 1.0 is deafult speed. Larger numbers make the voice faster, smaller numbers make it slower. This is only applicable for Telnyx Natural voices.
    - `api_key_ref` (string): The identifier for an integration secret /v2/integration_secrets that refers to your ElevenLabs API key. Warning: Free plans are unlikely to work with this integration.
    - `background_audio` (object) [required]: Optional background audio to play on the call. Use a predefined media bed, or supply a looped MP3 URL. If a media URL is chosen in the portal, customers can preview it before saving.oneOfobject objectobjectobject
      - `type` (string) [required]: *Possible values:* [`predefined_media` ]Select from predefined media options.
      - `value` (string) [required]: *Possible values:* [`silence` , `office` ] *Default value:* `silence` The predefined media to use. silence disables background audio.
      - `type` (string) [required]: *Possible values:* [`media_url` ]Provide a direct URL to an MP3 file. The audio will loop during the call.
      - `value` (string<uri>) [required]: HTTPS URL to an MP3 file.
      - `type` (string) [required]: *Possible values:* [`media_name` ]Reference a previously uploaded media by its name from Telnyx Media Storage.
      - `value` (string) [required]: The name of a media asset created via Media Storage API. The audio will loop during the call.
  - `transcription` (object)
    - `model` (string): *Possible values:* [`deepgram/flux` , `deepgram/nova-3` , `deepgram/nova-2` , `azure/fast` , `distil-whisper/distil-large-v2` , `openai/whisper-large-v3-turbo` ]The speech to text model to be used by the voice assistant. All the deepgram models are run on-premise. deepgram/flux is optimized for turn-taking but is English-only. deepgram/nova-3 is multi-lingual with automatic language detection but slightly higher latency.
    - `language` (string): The language of the audio to be transcribed. If not set, of if set to auto , the model will automatically detect the language.
    - `region` (Region (string)): Region on third party cloud providers (currently Azure) if using one of their models
    - `settings` (object)
      - `smart_format` (Smart Format (boolean))
      - `numerals` (Numerals (boolean))
      - `eot_threshold` (Eot Threshold (number)): Available only for deepgram/flux. Confidence required to trigger an end of turn. Higher values = more reliable turn detection but slightly increased latency.
      - `eot_timeout_ms` (Eot Timeout Ms (integer)): Available only for deepgram/flux. Maximum milliseconds of silence before forcing an end of turn, regardless of confidence.
  - `telephony_settings` (object)
    - `default_texml_app_id` (string): Default Texml App used for voice calls with your assistant. This will be created automatically on assistant creation.
    - `supports_unauthenticated_web_calls` (boolean): When enabled, allows users to interact with your AI assistant directly from your website without requiring authentication. This is required for FE widgets that work with assistants that have telephony enabled.
  - `messaging_settings` (object)
    - `default_messaging_profile_id` (string): Default Messaging Profile used for messaging exchanges with your assistant. This will be created automatically on assistant creation.
    - `delivery_status_webhook_url` (string): The URL where webhooks related to delivery statused for assistant messages will be sent.
  - `enabled_features` (EnabledFeatures (string)[]): *Possible values:* [`telephony` , `messaging` ]
  - `insight_settings` (object)
    - `insight_group_id` (string): Reference to an Insight Group. Insights in this group will be run automatically for all the assistant's conversations.
  - `privacy_settings` (object)
    - `data_retention` (boolean): If true, conversation history and insights will be stored. If false, they will not be stored. This in‑tool toggle governs solely the retention of conversation history and insights via the AI assistant. It has no effect on any separate recording, transcription, or storage configuration that you have set at the account, number, or application level. All such external settings remain in force regardless of your selection here.
  - `dynamic_variables_webhook_url` (string): If the dynamic_variables_webhook_url is set for the assistant, we will send a request at the start of the conversation. See our guide for more information.
  - `dynamic_variables` (object): Map of dynamic variables and their values
    - `property name*` (any): Map of dynamic variables and their values
  - `import_metadata` (object)
    - `import_provider` (string): *Possible values:* [`elevenlabs` , `vapi` , `retell` ]Provider the assistant was imported from.
    - `import_id` (string): ID of the assistant in the provider's system.

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/ai/assistants/import' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "provider": "elevenlabs",  "api_key_ref": "string"}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/import' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "provider": "elevenlabs",  "api_key_ref": "string"}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/import' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "provider": "elevenlabs",  "api_key_ref": "string"}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/import' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "provider": "elevenlabs",  "api_key_ref": "string"}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/import' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "provider": "elevenlabs",  "api_key_ref": "string"}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/import' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "provider": "elevenlabs",  "api_key_ref": "string"}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/import' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "provider": "elevenlabs",  "api_key_ref": "string"}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/import' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "provider": "elevenlabs",  "api_key_ref": "string"}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/import' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "provider": "elevenlabs",  "api_key_ref": "string"}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/import' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "provider": "elevenlabs",  "api_key_ref": "string"}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/import' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "provider": "elevenlabs",  "api_key_ref": "string"}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/import' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "provider": "elevenlabs",  "api_key_ref": "string"}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/import' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "provider": "elevenlabs",  "api_key_ref": "string"}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/import' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "provider": "elevenlabs",  "api_key_ref": "string"}'
```

## Response samples
```
{  "data": [    {      "id": "string",      "name": "string",      "created_at": "2024-07-29T15:51:28.071Z",      "description": "string",      "model": "string",      "instructions": "string",      "tools": [        {          "type": "webhook",          "webhook": {            "name": "string",            "description": "string",            "url": "https://example.com/api/v1/function",            "method": "POST",            "headers": [              {                "name": "string",                "value": "string"              }            ],            "body_parameters": {              "properties": {                "age": {                  "description": "The age of the customer.",                  "type": "integer"                },                "location": {                  "description": "The location of the customer.",                  "type": "string"                }              },              "required": [                "age",                "location"              ],              "type": "object"            },            "path_parameters": {              "properties": {                "id": {                  "description": "The id of the customer.",                  "type": "string"                }              },              "required": [                "id"              ],              "type": "object"            },            "query_parameters": {              "properties": {                "page": {                  "description": "The page number.",                  "type": "integer"                }              },              "required": [                "page"              ],              "type": "object"            }          }        },        {          "type": "retrieval",          "retrieval": {            "bucket_ids": [              "string"            ],            "max_num_results": 0          }        },        {          "type": "handoff",          "handoff": {            "voice_mode": "unified",            "ai_assistants": [              {                "name": "Scheduling Specialist",                "id": "assistant-1234567890abcdef"              }            ]          }        },        {          "type": "hangup",          "hangup": {            "description": "This tool is used to hang up the call."          }        },        {          "type": "transfer",          "transfer": {            "targets": [              {                "name": "Support",                "to": "+13129457420"              }            ],            "from": "+35319605860",            "warm_transfer_instructions": "Briefly greet the transfer recipient and provide any relevant information from the call. Let them know you will bridge the call right after.",            "custom_headers": [              {                "name": "string",                "value": "string"              }            ]          }        },        {          "type": "refer",          "refer": {            "targets": [              {                "name": "Support",                "sip_address": "sip:username@sip.non-telnyx-address.com",                "sip_auth_username": "string",                "sip_auth_password": "string"              }            ],            "sip_headers": [              {                "name": "User-to-User",                "value": "string"              }            ],            "custom_headers": [              {                "name": "string",                "value": "string"              }            ]          }        },        {          "type": "send_dtmf",          "send_dtmf": {}        }      ],      "greeting": "string",      "llm_api_key_ref": "string",      "voice_settings": {        "voice": "string",        "voice_speed": 1,        "api_key_ref": "string",        "background_audio": {          "type": "predefined_media",          "value": "silence"        }      },      "transcription": {        "model": "deepgram/flux",        "language": "string",        "region": "string",        "settings": {          "smart_format": true,          "numerals": true,          "eot_threshold": 0,          "eot_timeout_ms": 0        }      },      "telephony_settings": {        "default_texml_app_id": "string",        "supports_unauthenticated_web_calls": true      },      "messaging_settings": {        "default_messaging_profile_id": "string",        "delivery_status_webhook_url": "string"      },      "enabled_features": [        "telephony"      ],      "insight_settings": {        "insight_group_id": "string"      },      "privacy_settings": {        "data_retention": true      },      "dynamic_variables_webhook_url": "string",      "dynamic_variables": {},      "import_metadata": {        "import_provider": "elevenlabs",        "import_id": "string"      }    }  ]}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Get an assistant

Retrieve an AI Assistant configuration by `assistant_id`.

Get an assistant API{"@context":"http://schema.org","@type":"TechArticle","headline":"Get an assistant API","description":"Retrieve an AI Assistant configuration by `assistant_id`.","url":"https://developers.telnyx.com/api/inference/inference-embedding/get-assistant-public-assistants-assistant-id-get","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownGet an assistant
GET https://api.telnyx.com/v2/ai/assistants/:assistant_id
Retrieve an AI Assistant configuration by `assistant_id` .
Request ​
Responses ​200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `assistant_id` (Assistant Id) [required]

## Query Parameters
- `fetch_dynamic_variables_from_webhook` (Fetch Dynamic Variables From Webhook)
- `from` (From)
- `to` (To)
- `call_control_id` (Call Control Id)

## Response

## Response Schema - id
- `id` (string) [required]
- `name` (string) [required]
- `created_at` (string<date-time>) [required]
- `description` (string)
- `model` (string) [required]: ID of the model to use. You can use the Get models API to see all of your available models,
- `instructions` (string) [required]: System instructions for the assistant. These may be templated with dynamic variables
- `tools` (object[]) [required]: The tools that the assistant can use. These may be templated with dynamic variablesArray [oneOfWebhookTool WebhookToolRetrievalToolHandoffToolHangupToolTransferToolSIPReferToolDTMFTool]
  - `type` (string) [required]: *Possible values:* [`webhook` ]
  - `webhook` (object) [required]
    - `name` (string) [required]: The name of the tool.
    - `description` (string) [required]: The description of the tool.
    - `url` (string) [required]: The URL of the external tool to be called. This URL is going to be used by the assistant. The URL can be templated like: https://example.com/api/v1/{id} , where {id} is a placeholder for a value that will be provided by the assistant if path_parameters are provided with the id attribute.
    - `method` (string): *Possible values:* [`GET` , `POST` , `PUT` , `DELETE` , `PATCH` ] *Default value:* `POST` The HTTP method to be used when calling the external tool.
    - `headers` (object[]): The headers to be sent to the external tool.Array []
      - `name` (string)
      - `value` (string): The value of the header. Note that we support mustache templating for the value. For example you can use Bearer {{#integration_secret}}test-secret{{/integration_secret}} to pass the value of the integration secret as the bearer token. Telnyx signature headers will be automatically added to the request.
    - `body_parameters` (object): The body parameters the webhook tool accepts, described as a JSON Schema object. These parameters will be passed to the webhook as the body of the request. See the JSON Schema reference for documentation about the format
      - `properties` (object): The properties of the body parameters.
        - `property name*` (any): The properties of the body parameters.
      - `required` (string[]): The required properties of the body parameters.
      - `type` (string): *Possible values:* [`object` ]
    - `path_parameters` (object): The path parameters the webhook tool accepts, described as a JSON Schema object. These parameters will be passed to the webhook as the path of the request if the URL contains a placeholder for a value. See the JSON Schema reference for documentation about the format
      - `properties` (object): The properties of the path parameters.
        - `property name*` (any): The properties of the path parameters.
      - `required` (string[]): The required properties of the path parameters.
      - `type` (string): *Possible values:* [`object` ]
    - `query_parameters` (object): The query parameters the webhook tool accepts, described as a JSON Schema object. These parameters will be passed to the webhook as the query of the request. See the JSON Schema reference for documentation about the format
      - `properties` (object): The properties of the query parameters.
        - `property name*` (any): The properties of the query parameters.
      - `required` (string[]): The required properties of the query parameters.
      - `type` (string): *Possible values:* [`object` ]
  - `type` (string) [required]: *Possible values:* [`retrieval` ]
  - `retrieval` (object) [required]
    - `bucket_ids` (string[]) [required]: List of embedded storage buckets to use for retrieval-augmented generation.
    - `max_num_results` (integer): The maximum number of results to retrieve as context for the language model.
  - `type` (string) [required]: *Possible values:* [`handoff` ]
  - `handoff` (object) [required]
    - `voice_mode` (string): *Possible values:* [`unified` , `distinct` ]With the unified voice mode all assistants share the same voice, making the handoff transparent to the user. With the distinct voice mode all assistants retain their voice configuration, providing the experience of a conference call with a team of assistants.
    - `ai_assistants` (object[]) [required]: List of possible assistants that can receive a handoff.Array []
      - `name` (string) [required]: Helpful name for giving context on when to handoff to the assistant.
      - `id` (string) [required]: The ID of the assistant to hand off to.
  - `type` (string) [required]: *Possible values:* [`hangup` ]
  - `hangup` (object) [required]
    - `description` (string): *Default value:* `This tool is used to hang up the call.` The description of the function that will be passed to the assistant.
  - `type` (string) [required]: *Possible values:* [`transfer` ]
  - `transfer` (object) [required]
    - `targets` (object[]) [required]: The different possible targets of the transfer. The assistant will be able to choose one of the targets to transfer the call to.Array []
      - `name` (string): The name of the target.
      - `to` (string): The destination number or SIP URI of the call.
    - `from` (string) [required]: Number or SIP URI placing the call.
    - `warm_transfer_instructions` (string): Natural language instructions for your agent for how to provide context for the transfer recipient.
    - `custom_headers` (object[]): Custom headers to be added to the SIP INVITE for the transfer command.Array []
      - `name` (string)
      - `value` (string): The value of the header. Note that we support mustache templating for the value. For example you can use {{#integration_secret}}test-secret{{/integration_secret}} to pass the value of the integration secret.
  - `type` (string) [required]: *Possible values:* [`refer` ]
  - `refer` (object) [required]
    - `targets` (object[]) [required]: The different possible targets of the SIP refer. The assistant will be able to choose one of the targets to refer the call to.Array []
      - `name` (string) [required]: The name of the target.
      - `sip_address` (string) [required]: The SIP URI to which the call will be referred.
      - `sip_auth_username` (string): SIP Authentication username used for SIP challenges.
      - `sip_auth_password` (string): SIP Authentication password used for SIP challenges.
    - `sip_headers` (object[]): SIP headers to be added to the SIP REFER. Currently only User-to-User and Diversion headers are supported.Array []
      - `name` (string): *Possible values:* [`User-to-User` , `Diversion` ]
      - `value` (string): The value of the header. Note that we support mustache templating for the value. For example you can use {{#integration_secret}}test-secret{{/integration_secret}} to pass the value of the integration secret.
    - `custom_headers` (object[]): Custom headers to be added to the SIP REFER.Array []
      - `name` (string)
      - `value` (string): The value of the header. Note that we support mustache templating for the value. For example you can use {{#integration_secret}}test-secret{{/integration_secret}} to pass the value of the integration secret.
  - `type` (string) [required]: *Possible values:* [`send_dtmf` ]
  - `send_dtmf` (object) [required]
    - `property name*` (any)
- `greeting` (string): Text that the assistant will use to start the conversation. This may be templated with dynamic variables
- `llm_api_key_ref` (string): This is only needed when using third-party inference providers. The identifier for an integration secret /v2/integration_secrets that refers to your LLM provider's API key. Warning: Free plans are unlikely to work with this integration.
- `voice_settings` (object) [required]
  - `voice` (string) [required]: The voice to be used by the voice assistant. Check the full list of available voices via our voices API. To use ElevenLabs, you must reference your ElevenLabs API key as an integration secret under the api_key_ref field. See integration secrets documentation for details. For Telnyx voices, use Telnyx.<model_id>.<voice_id> (e.g. Telnyx.KokoroTTS.af_heart)
  - `voice_speed` (number): *Default value:* `1` The speed of the voice in the range [0.25, 2.0]. 1.0 is deafult speed. Larger numbers make the voice faster, smaller numbers make it slower. This is only applicable for Telnyx Natural voices.
  - `api_key_ref` (string): The identifier for an integration secret /v2/integration_secrets that refers to your ElevenLabs API key. Warning: Free plans are unlikely to work with this integration.
  - `background_audio` (object) [required]: Optional background audio to play on the call. Use a predefined media bed, or supply a looped MP3 URL. If a media URL is chosen in the portal, customers can preview it before saving.oneOfobject objectobjectobject
    - `type` (string) [required]: *Possible values:* [`predefined_media` ]Select from predefined media options.
    - `value` (string) [required]: *Possible values:* [`silence` , `office` ] *Default value:* `silence` The predefined media to use. silence disables background audio.
    - `type` (string) [required]: *Possible values:* [`media_url` ]Provide a direct URL to an MP3 file. The audio will loop during the call.
    - `value` (string<uri>) [required]: HTTPS URL to an MP3 file.
    - `type` (string) [required]: *Possible values:* [`media_name` ]Reference a previously uploaded media by its name from Telnyx Media Storage.
    - `value` (string) [required]: The name of a media asset created via Media Storage API. The audio will loop during the call.
- `transcription` (object)
  - `model` (string): *Possible values:* [`deepgram/flux` , `deepgram/nova-3` , `deepgram/nova-2` , `azure/fast` , `distil-whisper/distil-large-v2` , `openai/whisper-large-v3-turbo` ]The speech to text model to be used by the voice assistant. All the deepgram models are run on-premise. deepgram/flux is optimized for turn-taking but is English-only. deepgram/nova-3 is multi-lingual with automatic language detection but slightly higher latency.
  - `language` (string): The language of the audio to be transcribed. If not set, of if set to auto , the model will automatically detect the language.
  - `region` (Region (string)): Region on third party cloud providers (currently Azure) if using one of their models
  - `settings` (object)
    - `smart_format` (Smart Format (boolean))
    - `numerals` (Numerals (boolean))
    - `eot_threshold` (Eot Threshold (number)): Available only for deepgram/flux. Confidence required to trigger an end of turn. Higher values = more reliable turn detection but slightly increased latency.
    - `eot_timeout_ms` (Eot Timeout Ms (integer)): Available only for deepgram/flux. Maximum milliseconds of silence before forcing an end of turn, regardless of confidence.
- `telephony_settings` (object)
  - `default_texml_app_id` (string): Default Texml App used for voice calls with your assistant. This will be created automatically on assistant creation.
  - `supports_unauthenticated_web_calls` (boolean): When enabled, allows users to interact with your AI assistant directly from your website without requiring authentication. This is required for FE widgets that work with assistants that have telephony enabled.
- `messaging_settings` (object)
  - `default_messaging_profile_id` (string): Default Messaging Profile used for messaging exchanges with your assistant. This will be created automatically on assistant creation.
  - `delivery_status_webhook_url` (string): The URL where webhooks related to delivery statused for assistant messages will be sent.
- `enabled_features` (EnabledFeatures (string)[]): *Possible values:* [`telephony` , `messaging` ]
- `insight_settings` (object)
  - `insight_group_id` (string): Reference to an Insight Group. Insights in this group will be run automatically for all the assistant's conversations.
- `privacy_settings` (object)
  - `data_retention` (boolean): If true, conversation history and insights will be stored. If false, they will not be stored. This in‑tool toggle governs solely the retention of conversation history and insights via the AI assistant. It has no effect on any separate recording, transcription, or storage configuration that you have set at the account, number, or application level. All such external settings remain in force regardless of your selection here.
- `dynamic_variables_webhook_url` (string): If the dynamic_variables_webhook_url is set for the assistant, we will send a request at the start of the conversation. See our guide for more information.
- `dynamic_variables` (object): Map of dynamic variables and their values
  - `property name*` (any): Map of dynamic variables and their values
- `import_metadata` (object)
  - `import_provider` (string): *Possible values:* [`elevenlabs` , `vapi` , `retell` ]Provider the assistant was imported from.
  - `import_id` (string): ID of the assistant in the provider's system.

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "id": "string",  "name": "string",  "created_at": "2024-07-29T15:51:28.071Z",  "description": "string",  "model": "string",  "instructions": "string",  "tools": [    {      "type": "webhook",      "webhook": {        "name": "string",        "description": "string",        "url": "https://example.com/api/v1/function",        "method": "POST",        "headers": [          {            "name": "string",            "value": "string"          }        ],        "body_parameters": {          "properties": {            "age": {              "description": "The age of the customer.",              "type": "integer"            },            "location": {              "description": "The location of the customer.",              "type": "string"            }          },          "required": [            "age",            "location"          ],          "type": "object"        },        "path_parameters": {          "properties": {            "id": {              "description": "The id of the customer.",              "type": "string"            }          },          "required": [            "id"          ],          "type": "object"        },        "query_parameters": {          "properties": {            "page": {              "description": "The page number.",              "type": "integer"            }          },          "required": [            "page"          ],          "type": "object"        }      }    },    {      "type": "retrieval",      "retrieval": {        "bucket_ids": [          "string"        ],        "max_num_results": 0      }    },    {      "type": "handoff",      "handoff": {        "voice_mode": "unified",        "ai_assistants": [          {            "name": "Scheduling Specialist",            "id": "assistant-1234567890abcdef"          }        ]      }    },    {      "type": "hangup",      "hangup": {        "description": "This tool is used to hang up the call."      }    },    {      "type": "transfer",      "transfer": {        "targets": [          {            "name": "Support",            "to": "+13129457420"          }        ],        "from": "+35319605860",        "warm_transfer_instructions": "Briefly greet the transfer recipient and provide any relevant information from the call. Let them know you will bridge the call right after.",        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "refer",      "refer": {        "targets": [          {            "name": "Support",            "sip_address": "sip:username@sip.non-telnyx-address.com",            "sip_auth_username": "string",            "sip_auth_password": "string"          }        ],        "sip_headers": [          {            "name": "User-to-User",            "value": "string"          }        ],        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "send_dtmf",      "send_dtmf": {}    }  ],  "greeting": "string",  "llm_api_key_ref": "string",  "voice_settings": {    "voice": "string",    "voice_speed": 1,    "api_key_ref": "string",    "background_audio": {      "type": "predefined_media",      "value": "silence"    }  },  "transcription": {    "model": "deepgram/flux",    "language": "string",    "region": "string",    "settings": {      "smart_format": true,      "numerals": true,      "eot_threshold": 0,      "eot_timeout_ms": 0    }  },  "telephony_settings": {    "default_texml_app_id": "string",    "supports_unauthenticated_web_calls": true  },  "messaging_settings": {    "default_messaging_profile_id": "string",    "delivery_status_webhook_url": "string"  },  "enabled_features": [    "telephony"  ],  "insight_settings": {    "insight_group_id": "string"  },  "privacy_settings": {    "data_retention": true  },  "dynamic_variables_webhook_url": "string",  "dynamic_variables": {},  "import_metadata": {    "import_provider": "elevenlabs",    "import_id": "string"  }}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Update an assistant

Update an AI Assistant's attributes.

Update an assistant API{"@context":"http://schema.org","@type":"TechArticle","headline":"Update an assistant API","description":"Update an AI Assistant's attributes.","url":"https://developers.telnyx.com/api/inference/inference-embedding/update-assistant-public-assistants-assistant-id-post","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownUpdate an assistant
POST https://api.telnyx.com/v2/ai/assistants/:assistant_id
Update an AI Assistant's attributes.
Request ​
Responses ​200: Successful ResponseSchema Schema422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `assistant_id` (Assistant Id) [required]

## Request Body
- `name` (string)
- `model` (string): ID of the model to use. You can use the Get models API to see all of your available models,
- `instructions` (string): System instructions for the assistant. These may be templated with dynamic variables
- `tools` (object[]) [required]: The tools that the assistant can use. These may be templated with dynamic variablesArray [oneOfWebhookTool WebhookToolRetrievalToolHandoffToolHangupToolTransferToolSIPReferToolDTMFTool]
  - `type` (string) [required]: *Possible values:* [`webhook` ]
  - `webhook` (object) [required]
    - `name` (string) [required]: The name of the tool.
    - `description` (string) [required]: The description of the tool.
    - `url` (string) [required]: The URL of the external tool to be called. This URL is going to be used by the assistant. The URL can be templated like: https://example.com/api/v1/{id} , where {id} is a placeholder for a value that will be provided by the assistant if path_parameters are provided with the id attribute.
    - `method` (string): *Possible values:* [`GET` , `POST` , `PUT` , `DELETE` , `PATCH` ] *Default value:* `POST` The HTTP method to be used when calling the external tool.
    - `headers` (object[]): The headers to be sent to the external tool.Array []
      - `name` (string)
      - `value` (string): The value of the header. Note that we support mustache templating for the value. For example you can use Bearer {{#integration_secret}}test-secret{{/integration_secret}} to pass the value of the integration secret as the bearer token. Telnyx signature headers will be automatically added to the request.
    - `body_parameters` (object): The body parameters the webhook tool accepts, described as a JSON Schema object. These parameters will be passed to the webhook as the body of the request. See the JSON Schema reference for documentation about the format
      - `properties` (object): The properties of the body parameters.
        - `property name*` (any): The properties of the body parameters.
      - `required` (string[]): The required properties of the body parameters.
      - `type` (string): *Possible values:* [`object` ]
    - `path_parameters` (object): The path parameters the webhook tool accepts, described as a JSON Schema object. These parameters will be passed to the webhook as the path of the request if the URL contains a placeholder for a value. See the JSON Schema reference for documentation about the format
      - `properties` (object): The properties of the path parameters.
        - `property name*` (any): The properties of the path parameters.
      - `required` (string[]): The required properties of the path parameters.
      - `type` (string): *Possible values:* [`object` ]
    - `query_parameters` (object): The query parameters the webhook tool accepts, described as a JSON Schema object. These parameters will be passed to the webhook as the query of the request. See the JSON Schema reference for documentation about the format
      - `properties` (object): The properties of the query parameters.
        - `property name*` (any): The properties of the query parameters.
      - `required` (string[]): The required properties of the query parameters.
      - `type` (string): *Possible values:* [`object` ]
  - `type` (string) [required]: *Possible values:* [`retrieval` ]
  - `retrieval` (object) [required]
    - `bucket_ids` (string[]) [required]: List of embedded storage buckets to use for retrieval-augmented generation.
    - `max_num_results` (integer): The maximum number of results to retrieve as context for the language model.
  - `type` (string) [required]: *Possible values:* [`handoff` ]
  - `handoff` (object) [required]
    - `voice_mode` (string): *Possible values:* [`unified` , `distinct` ]With the unified voice mode all assistants share the same voice, making the handoff transparent to the user. With the distinct voice mode all assistants retain their voice configuration, providing the experience of a conference call with a team of assistants.
    - `ai_assistants` (object[]) [required]: List of possible assistants that can receive a handoff.Array []
      - `name` (string) [required]: Helpful name for giving context on when to handoff to the assistant.
      - `id` (string) [required]: The ID of the assistant to hand off to.
  - `type` (string) [required]: *Possible values:* [`hangup` ]
  - `hangup` (object) [required]
    - `description` (string): *Default value:* `This tool is used to hang up the call.` The description of the function that will be passed to the assistant.
  - `type` (string) [required]: *Possible values:* [`transfer` ]
  - `transfer` (object) [required]
    - `targets` (object[]) [required]: The different possible targets of the transfer. The assistant will be able to choose one of the targets to transfer the call to.Array []
      - `name` (string): The name of the target.
      - `to` (string): The destination number or SIP URI of the call.
    - `from` (string) [required]: Number or SIP URI placing the call.
    - `warm_transfer_instructions` (string): Natural language instructions for your agent for how to provide context for the transfer recipient.
    - `custom_headers` (object[]): Custom headers to be added to the SIP INVITE for the transfer command.Array []
      - `name` (string)
      - `value` (string): The value of the header. Note that we support mustache templating for the value. For example you can use {{#integration_secret}}test-secret{{/integration_secret}} to pass the value of the integration secret.
  - `type` (string) [required]: *Possible values:* [`refer` ]
  - `refer` (object) [required]
    - `targets` (object[]) [required]: The different possible targets of the SIP refer. The assistant will be able to choose one of the targets to refer the call to.Array []
      - `name` (string) [required]: The name of the target.
      - `sip_address` (string) [required]: The SIP URI to which the call will be referred.
      - `sip_auth_username` (string): SIP Authentication username used for SIP challenges.
      - `sip_auth_password` (string): SIP Authentication password used for SIP challenges.
    - `sip_headers` (object[]): SIP headers to be added to the SIP REFER. Currently only User-to-User and Diversion headers are supported.Array []
      - `name` (string): *Possible values:* [`User-to-User` , `Diversion` ]
      - `value` (string): The value of the header. Note that we support mustache templating for the value. For example you can use {{#integration_secret}}test-secret{{/integration_secret}} to pass the value of the integration secret.
    - `custom_headers` (object[]): Custom headers to be added to the SIP REFER.Array []
      - `name` (string)
      - `value` (string): The value of the header. Note that we support mustache templating for the value. For example you can use {{#integration_secret}}test-secret{{/integration_secret}} to pass the value of the integration secret.
  - `type` (string) [required]: *Possible values:* [`send_dtmf` ]
  - `send_dtmf` (object) [required]
    - `property name*` (any)
- `description` (string)
- `greeting` (string): Text that the assistant will use to start the conversation. This may be templated with dynamic variables
- `llm_api_key_ref` (string): This is only needed when using third-party inference providers. The identifier for an integration secret /v2/integration_secrets that refers to your LLM provider's API key. Warning: Free plans are unlikely to work with this integration.
- `voice_settings` (object) [required]
  - `voice` (string) [required]: The voice to be used by the voice assistant. Check the full list of available voices via our voices API. To use ElevenLabs, you must reference your ElevenLabs API key as an integration secret under the api_key_ref field. See integration secrets documentation for details. For Telnyx voices, use Telnyx.<model_id>.<voice_id> (e.g. Telnyx.KokoroTTS.af_heart)
  - `voice_speed` (number): *Default value:* `1` The speed of the voice in the range [0.25, 2.0]. 1.0 is deafult speed. Larger numbers make the voice faster, smaller numbers make it slower. This is only applicable for Telnyx Natural voices.
  - `api_key_ref` (string): The identifier for an integration secret /v2/integration_secrets that refers to your ElevenLabs API key. Warning: Free plans are unlikely to work with this integration.
  - `background_audio` (object) [required]: Optional background audio to play on the call. Use a predefined media bed, or supply a looped MP3 URL. If a media URL is chosen in the portal, customers can preview it before saving.oneOfobject objectobjectobject
    - `type` (string) [required]: *Possible values:* [`predefined_media` ]Select from predefined media options.
    - `value` (string) [required]: *Possible values:* [`silence` , `office` ] *Default value:* `silence` The predefined media to use. silence disables background audio.
    - `type` (string) [required]: *Possible values:* [`media_url` ]Provide a direct URL to an MP3 file. The audio will loop during the call.
    - `value` (string<uri>) [required]: HTTPS URL to an MP3 file.
    - `type` (string) [required]: *Possible values:* [`media_name` ]Reference a previously uploaded media by its name from Telnyx Media Storage.
    - `value` (string) [required]: The name of a media asset created via Media Storage API. The audio will loop during the call.
- `transcription` (object)
  - `model` (string): *Possible values:* [`deepgram/flux` , `deepgram/nova-3` , `deepgram/nova-2` , `azure/fast` , `distil-whisper/distil-large-v2` , `openai/whisper-large-v3-turbo` ]The speech to text model to be used by the voice assistant. All the deepgram models are run on-premise. deepgram/flux is optimized for turn-taking but is English-only. deepgram/nova-3 is multi-lingual with automatic language detection but slightly higher latency.
  - `language` (string): The language of the audio to be transcribed. If not set, of if set to auto , the model will automatically detect the language.
  - `region` (Region (string)): Region on third party cloud providers (currently Azure) if using one of their models
  - `settings` (object)
    - `smart_format` (Smart Format (boolean))
    - `numerals` (Numerals (boolean))
    - `eot_threshold` (Eot Threshold (number)): Available only for deepgram/flux. Confidence required to trigger an end of turn. Higher values = more reliable turn detection but slightly increased latency.
    - `eot_timeout_ms` (Eot Timeout Ms (integer)): Available only for deepgram/flux. Maximum milliseconds of silence before forcing an end of turn, regardless of confidence.
- `telephony_settings` (object)
  - `default_texml_app_id` (string): Default Texml App used for voice calls with your assistant. This will be created automatically on assistant creation.
  - `supports_unauthenticated_web_calls` (boolean): When enabled, allows users to interact with your AI assistant directly from your website without requiring authentication. This is required for FE widgets that work with assistants that have telephony enabled.
- `messaging_settings` (object)
  - `default_messaging_profile_id` (string): Default Messaging Profile used for messaging exchanges with your assistant. This will be created automatically on assistant creation.
  - `delivery_status_webhook_url` (string): The URL where webhooks related to delivery statused for assistant messages will be sent.
- `enabled_features` (EnabledFeatures (string)[]): *Possible values:* [`telephony` , `messaging` ]
- `insight_settings` (object)
  - `insight_group_id` (string): Reference to an Insight Group. Insights in this group will be run automatically for all the assistant's conversations.
- `privacy_settings` (object)
  - `data_retention` (boolean): If true, conversation history and insights will be stored. If false, they will not be stored. This in‑tool toggle governs solely the retention of conversation history and insights via the AI assistant. It has no effect on any separate recording, transcription, or storage configuration that you have set at the account, number, or application level. All such external settings remain in force regardless of your selection here.
- `dynamic_variables_webhook_url` (string): If the dynamic_variables_webhook_url is set for the assistant, we will send a request at the start of the conversation. See our guide for more information.
- `dynamic_variables` (object): Map of dynamic variables and their default values
  - `property name*` (any): Map of dynamic variables and their default values
- `promote_to_main` (boolean): *Default value:* `true` Indicates whether the assistant should be promoted to the main version. Defaults to true.

## Response

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "name": "string",  "model": "string",  "instructions": "string",  "tools": [    {      "type": "webhook",      "webhook": {        "name": "string",        "description": "string",        "url": "https://example.com/api/v1/function",        "method": "POST",        "headers": [          {            "name": "string",            "value": "string"          }        ],        "body_parameters": {          "properties": {            "age": {              "description": "The age of the customer.",              "type": "integer"            },            "location": {              "description": "The location of the customer.",              "type": "string"            }          },          "required": [            "age",            "location"          ],          "type": "object"        },        "path_parameters": {          "properties": {            "id": {              "description": "The id of the customer.",              "type": "string"            }          },          "required": [            "id"          ],          "type": "object"        },        "query_parameters": {          "properties": {            "page": {              "description": "The page number.",              "type": "integer"            }          },          "required": [            "page"          ],          "type": "object"        }      }    },    {      "type": "retrieval",      "retrieval": {        "bucket_ids": [          "string"        ],        "max_num_results": 0      }    },    {      "type": "handoff",      "handoff": {        "voice_mode": "unified",        "ai_assistants": [          {            "name": "Scheduling Specialist",            "id": "assistant-1234567890abcdef"          }        ]      }    },    {      "type": "hangup",      "hangup": {        "description": "This tool is used to hang up the call."      }    },    {      "type": "transfer",      "transfer": {        "targets": [          {            "name": "Support",            "to": "+13129457420"          }        ],        "from": "+35319605860",        "warm_transfer_instructions": "Briefly greet the transfer recipient and provide any relevant information from the call. Let them know you will bridge the call right after.",        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "refer",      "refer": {        "targets": [          {            "name": "Support",            "sip_address": "sip:username@sip.non-telnyx-address.com",            "sip_auth_username": "string",            "sip_auth_password": "string"          }        ],        "sip_headers": [          {            "name": "User-to-User",            "value": "string"          }        ],        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "send_dtmf",      "send_dtmf": {}    }  ],  "description": "string",  "greeting": "string",  "llm_api_key_ref": "string",  "voice_settings": {    "voice": "string",    "voice_speed": 1,    "api_key_ref": "string",    "background_audio": {      "type": "predefined_media",      "value": "silence"    }  },  "transcription": {    "model": "deepgram/flux",    "language": "string",    "region": "string",    "settings": {      "smart_format": true,      "numerals": true,      "eot_threshold": 0,      "eot_timeout_ms": 0    }  },  "telephony_settings": {    "default_texml_app_id": "string",    "supports_unauthenticated_web_calls": true  },  "messaging_settings": {    "default_messaging_profile_id": "string",    "delivery_status_webhook_url": "string"  },  "enabled_features": [    "telephony"  ],  "insight_settings": {    "insight_group_id": "string"  },  "privacy_settings": {    "data_retention": true  },  "dynamic_variables_webhook_url": "string",  "dynamic_variables": {},  "promote_to_main": true}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "name": "string",  "model": "string",  "instructions": "string",  "tools": [    {      "type": "webhook",      "webhook": {        "name": "string",        "description": "string",        "url": "https://example.com/api/v1/function",        "method": "POST",        "headers": [          {            "name": "string",            "value": "string"          }        ],        "body_parameters": {          "properties": {            "age": {              "description": "The age of the customer.",              "type": "integer"            },            "location": {              "description": "The location of the customer.",              "type": "string"            }          },          "required": [            "age",            "location"          ],          "type": "object"        },        "path_parameters": {          "properties": {            "id": {              "description": "The id of the customer.",              "type": "string"            }          },          "required": [            "id"          ],          "type": "object"        },        "query_parameters": {          "properties": {            "page": {              "description": "The page number.",              "type": "integer"            }          },          "required": [            "page"          ],          "type": "object"        }      }    },    {      "type": "retrieval",      "retrieval": {        "bucket_ids": [          "string"        ],        "max_num_results": 0      }    },    {      "type": "handoff",      "handoff": {        "voice_mode": "unified",        "ai_assistants": [          {            "name": "Scheduling Specialist",            "id": "assistant-1234567890abcdef"          }        ]      }    },    {      "type": "hangup",      "hangup": {        "description": "This tool is used to hang up the call."      }    },    {      "type": "transfer",      "transfer": {        "targets": [          {            "name": "Support",            "to": "+13129457420"          }        ],        "from": "+35319605860",        "warm_transfer_instructions": "Briefly greet the transfer recipient and provide any relevant information from the call. Let them know you will bridge the call right after.",        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "refer",      "refer": {        "targets": [          {            "name": "Support",            "sip_address": "sip:username@sip.non-telnyx-address.com",            "sip_auth_username": "string",            "sip_auth_password": "string"          }        ],        "sip_headers": [          {            "name": "User-to-User",            "value": "string"          }        ],        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "send_dtmf",      "send_dtmf": {}    }  ],  "description": "string",  "greeting": "string",  "llm_api_key_ref": "string",  "voice_settings": {    "voice": "string",    "voice_speed": 1,    "api_key_ref": "string",    "background_audio": {      "type": "predefined_media",      "value": "silence"    }  },  "transcription": {    "model": "deepgram/flux",    "language": "string",    "region": "string",    "settings": {      "smart_format": true,      "numerals": true,      "eot_threshold": 0,      "eot_timeout_ms": 0    }  },  "telephony_settings": {    "default_texml_app_id": "string",    "supports_unauthenticated_web_calls": true  },  "messaging_settings": {    "default_messaging_profile_id": "string",    "delivery_status_webhook_url": "string"  },  "enabled_features": [    "telephony"  ],  "insight_settings": {    "insight_group_id": "string"  },  "privacy_settings": {    "data_retention": true  },  "dynamic_variables_webhook_url": "string",  "dynamic_variables": {},  "promote_to_main": true}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "name": "string",  "model": "string",  "instructions": "string",  "tools": [    {      "type": "webhook",      "webhook": {        "name": "string",        "description": "string",        "url": "https://example.com/api/v1/function",        "method": "POST",        "headers": [          {            "name": "string",            "value": "string"          }        ],        "body_parameters": {          "properties": {            "age": {              "description": "The age of the customer.",              "type": "integer"            },            "location": {              "description": "The location of the customer.",              "type": "string"            }          },          "required": [            "age",            "location"          ],          "type": "object"        },        "path_parameters": {          "properties": {            "id": {              "description": "The id of the customer.",              "type": "string"            }          },          "required": [            "id"          ],          "type": "object"        },        "query_parameters": {          "properties": {            "page": {              "description": "The page number.",              "type": "integer"            }          },          "required": [            "page"          ],          "type": "object"        }      }    },    {      "type": "retrieval",      "retrieval": {        "bucket_ids": [          "string"        ],        "max_num_results": 0      }    },    {      "type": "handoff",      "handoff": {        "voice_mode": "unified",        "ai_assistants": [          {            "name": "Scheduling Specialist",            "id": "assistant-1234567890abcdef"          }        ]      }    },    {      "type": "hangup",      "hangup": {        "description": "This tool is used to hang up the call."      }    },    {      "type": "transfer",      "transfer": {        "targets": [          {            "name": "Support",            "to": "+13129457420"          }        ],        "from": "+35319605860",        "warm_transfer_instructions": "Briefly greet the transfer recipient and provide any relevant information from the call. Let them know you will bridge the call right after.",        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "refer",      "refer": {        "targets": [          {            "name": "Support",            "sip_address": "sip:username@sip.non-telnyx-address.com",            "sip_auth_username": "string",            "sip_auth_password": "string"          }        ],        "sip_headers": [          {            "name": "User-to-User",            "value": "string"          }        ],        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "send_dtmf",      "send_dtmf": {}    }  ],  "description": "string",  "greeting": "string",  "llm_api_key_ref": "string",  "voice_settings": {    "voice": "string",    "voice_speed": 1,    "api_key_ref": "string",    "background_audio": {      "type": "predefined_media",      "value": "silence"    }  },  "transcription": {    "model": "deepgram/flux",    "language": "string",    "region": "string",    "settings": {      "smart_format": true,      "numerals": true,      "eot_threshold": 0,      "eot_timeout_ms": 0    }  },  "telephony_settings": {    "default_texml_app_id": "string",    "supports_unauthenticated_web_calls": true  },  "messaging_settings": {    "default_messaging_profile_id": "string",    "delivery_status_webhook_url": "string"  },  "enabled_features": [    "telephony"  ],  "insight_settings": {    "insight_group_id": "string"  },  "privacy_settings": {    "data_retention": true  },  "dynamic_variables_webhook_url": "string",  "dynamic_variables": {},  "promote_to_main": true}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "name": "string",  "model": "string",  "instructions": "string",  "tools": [    {      "type": "webhook",      "webhook": {        "name": "string",        "description": "string",        "url": "https://example.com/api/v1/function",        "method": "POST",        "headers": [          {            "name": "string",            "value": "string"          }        ],        "body_parameters": {          "properties": {            "age": {              "description": "The age of the customer.",              "type": "integer"            },            "location": {              "description": "The location of the customer.",              "type": "string"            }          },          "required": [            "age",            "location"          ],          "type": "object"        },        "path_parameters": {          "properties": {            "id": {              "description": "The id of the customer.",              "type": "string"            }          },          "required": [            "id"          ],          "type": "object"        },        "query_parameters": {          "properties": {            "page": {              "description": "The page number.",              "type": "integer"            }          },          "required": [            "page"          ],          "type": "object"        }      }    },    {      "type": "retrieval",      "retrieval": {        "bucket_ids": [          "string"        ],        "max_num_results": 0      }    },    {      "type": "handoff",      "handoff": {        "voice_mode": "unified",        "ai_assistants": [          {            "name": "Scheduling Specialist",            "id": "assistant-1234567890abcdef"          }        ]      }    },    {      "type": "hangup",      "hangup": {        "description": "This tool is used to hang up the call."      }    },    {      "type": "transfer",      "transfer": {        "targets": [          {            "name": "Support",            "to": "+13129457420"          }        ],        "from": "+35319605860",        "warm_transfer_instructions": "Briefly greet the transfer recipient and provide any relevant information from the call. Let them know you will bridge the call right after.",        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "refer",      "refer": {        "targets": [          {            "name": "Support",            "sip_address": "sip:username@sip.non-telnyx-address.com",            "sip_auth_username": "string",            "sip_auth_password": "string"          }        ],        "sip_headers": [          {            "name": "User-to-User",            "value": "string"          }        ],        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "send_dtmf",      "send_dtmf": {}    }  ],  "description": "string",  "greeting": "string",  "llm_api_key_ref": "string",  "voice_settings": {    "voice": "string",    "voice_speed": 1,    "api_key_ref": "string",    "background_audio": {      "type": "predefined_media",      "value": "silence"    }  },  "transcription": {    "model": "deepgram/flux",    "language": "string",    "region": "string",    "settings": {      "smart_format": true,      "numerals": true,      "eot_threshold": 0,      "eot_timeout_ms": 0    }  },  "telephony_settings": {    "default_texml_app_id": "string",    "supports_unauthenticated_web_calls": true  },  "messaging_settings": {    "default_messaging_profile_id": "string",    "delivery_status_webhook_url": "string"  },  "enabled_features": [    "telephony"  ],  "insight_settings": {    "insight_group_id": "string"  },  "privacy_settings": {    "data_retention": true  },  "dynamic_variables_webhook_url": "string",  "dynamic_variables": {},  "promote_to_main": true}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "name": "string",  "model": "string",  "instructions": "string",  "tools": [    {      "type": "webhook",      "webhook": {        "name": "string",        "description": "string",        "url": "https://example.com/api/v1/function",        "method": "POST",        "headers": [          {            "name": "string",            "value": "string"          }        ],        "body_parameters": {          "properties": {            "age": {              "description": "The age of the customer.",              "type": "integer"            },            "location": {              "description": "The location of the customer.",              "type": "string"            }          },          "required": [            "age",            "location"          ],          "type": "object"        },        "path_parameters": {          "properties": {            "id": {              "description": "The id of the customer.",              "type": "string"            }          },          "required": [            "id"          ],          "type": "object"        },        "query_parameters": {          "properties": {            "page": {              "description": "The page number.",              "type": "integer"            }          },          "required": [            "page"          ],          "type": "object"        }      }    },    {      "type": "retrieval",      "retrieval": {        "bucket_ids": [          "string"        ],        "max_num_results": 0      }    },    {      "type": "handoff",      "handoff": {        "voice_mode": "unified",        "ai_assistants": [          {            "name": "Scheduling Specialist",            "id": "assistant-1234567890abcdef"          }        ]      }    },    {      "type": "hangup",      "hangup": {        "description": "This tool is used to hang up the call."      }    },    {      "type": "transfer",      "transfer": {        "targets": [          {            "name": "Support",            "to": "+13129457420"          }        ],        "from": "+35319605860",        "warm_transfer_instructions": "Briefly greet the transfer recipient and provide any relevant information from the call. Let them know you will bridge the call right after.",        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "refer",      "refer": {        "targets": [          {            "name": "Support",            "sip_address": "sip:username@sip.non-telnyx-address.com",            "sip_auth_username": "string",            "sip_auth_password": "string"          }        ],        "sip_headers": [          {            "name": "User-to-User",            "value": "string"          }        ],        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "send_dtmf",      "send_dtmf": {}    }  ],  "description": "string",  "greeting": "string",  "llm_api_key_ref": "string",  "voice_settings": {    "voice": "string",    "voice_speed": 1,    "api_key_ref": "string",    "background_audio": {      "type": "predefined_media",      "value": "silence"    }  },  "transcription": {    "model": "deepgram/flux",    "language": "string",    "region": "string",    "settings": {      "smart_format": true,      "numerals": true,      "eot_threshold": 0,      "eot_timeout_ms": 0    }  },  "telephony_settings": {    "default_texml_app_id": "string",    "supports_unauthenticated_web_calls": true  },  "messaging_settings": {    "default_messaging_profile_id": "string",    "delivery_status_webhook_url": "string"  },  "enabled_features": [    "telephony"  ],  "insight_settings": {    "insight_group_id": "string"  },  "privacy_settings": {    "data_retention": true  },  "dynamic_variables_webhook_url": "string",  "dynamic_variables": {},  "promote_to_main": true}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "name": "string",  "model": "string",  "instructions": "string",  "tools": [    {      "type": "webhook",      "webhook": {        "name": "string",        "description": "string",        "url": "https://example.com/api/v1/function",        "method": "POST",        "headers": [          {            "name": "string",            "value": "string"          }        ],        "body_parameters": {          "properties": {            "age": {              "description": "The age of the customer.",              "type": "integer"            },            "location": {              "description": "The location of the customer.",              "type": "string"            }          },          "required": [            "age",            "location"          ],          "type": "object"        },        "path_parameters": {          "properties": {            "id": {              "description": "The id of the customer.",              "type": "string"            }          },          "required": [            "id"          ],          "type": "object"        },        "query_parameters": {          "properties": {            "page": {              "description": "The page number.",              "type": "integer"            }          },          "required": [            "page"          ],          "type": "object"        }      }    },    {      "type": "retrieval",      "retrieval": {        "bucket_ids": [          "string"        ],        "max_num_results": 0      }    },    {      "type": "handoff",      "handoff": {        "voice_mode": "unified",        "ai_assistants": [          {            "name": "Scheduling Specialist",            "id": "assistant-1234567890abcdef"          }        ]      }    },    {      "type": "hangup",      "hangup": {        "description": "This tool is used to hang up the call."      }    },    {      "type": "transfer",      "transfer": {        "targets": [          {            "name": "Support",            "to": "+13129457420"          }        ],        "from": "+35319605860",        "warm_transfer_instructions": "Briefly greet the transfer recipient and provide any relevant information from the call. Let them know you will bridge the call right after.",        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "refer",      "refer": {        "targets": [          {            "name": "Support",            "sip_address": "sip:username@sip.non-telnyx-address.com",            "sip_auth_username": "string",            "sip_auth_password": "string"          }        ],        "sip_headers": [          {            "name": "User-to-User",            "value": "string"          }        ],        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "send_dtmf",      "send_dtmf": {}    }  ],  "description": "string",  "greeting": "string",  "llm_api_key_ref": "string",  "voice_settings": {    "voice": "string",    "voice_speed": 1,    "api_key_ref": "string",    "background_audio": {      "type": "predefined_media",      "value": "silence"    }  },  "transcription": {    "model": "deepgram/flux",    "language": "string",    "region": "string",    "settings": {      "smart_format": true,      "numerals": true,      "eot_threshold": 0,      "eot_timeout_ms": 0    }  },  "telephony_settings": {    "default_texml_app_id": "string",    "supports_unauthenticated_web_calls": true  },  "messaging_settings": {    "default_messaging_profile_id": "string",    "delivery_status_webhook_url": "string"  },  "enabled_features": [    "telephony"  ],  "insight_settings": {    "insight_group_id": "string"  },  "privacy_settings": {    "data_retention": true  },  "dynamic_variables_webhook_url": "string",  "dynamic_variables": {},  "promote_to_main": true}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "name": "string",  "model": "string",  "instructions": "string",  "tools": [    {      "type": "webhook",      "webhook": {        "name": "string",        "description": "string",        "url": "https://example.com/api/v1/function",        "method": "POST",        "headers": [          {            "name": "string",            "value": "string"          }        ],        "body_parameters": {          "properties": {            "age": {              "description": "The age of the customer.",              "type": "integer"            },            "location": {              "description": "The location of the customer.",              "type": "string"            }          },          "required": [            "age",            "location"          ],          "type": "object"        },        "path_parameters": {          "properties": {            "id": {              "description": "The id of the customer.",              "type": "string"            }          },          "required": [            "id"          ],          "type": "object"        },        "query_parameters": {          "properties": {            "page": {              "description": "The page number.",              "type": "integer"            }          },          "required": [            "page"          ],          "type": "object"        }      }    },    {      "type": "retrieval",      "retrieval": {        "bucket_ids": [          "string"        ],        "max_num_results": 0      }    },    {      "type": "handoff",      "handoff": {        "voice_mode": "unified",        "ai_assistants": [          {            "name": "Scheduling Specialist",            "id": "assistant-1234567890abcdef"          }        ]      }    },    {      "type": "hangup",      "hangup": {        "description": "This tool is used to hang up the call."      }    },    {      "type": "transfer",      "transfer": {        "targets": [          {            "name": "Support",            "to": "+13129457420"          }        ],        "from": "+35319605860",        "warm_transfer_instructions": "Briefly greet the transfer recipient and provide any relevant information from the call. Let them know you will bridge the call right after.",        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "refer",      "refer": {        "targets": [          {            "name": "Support",            "sip_address": "sip:username@sip.non-telnyx-address.com",            "sip_auth_username": "string",            "sip_auth_password": "string"          }        ],        "sip_headers": [          {            "name": "User-to-User",            "value": "string"          }        ],        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "send_dtmf",      "send_dtmf": {}    }  ],  "description": "string",  "greeting": "string",  "llm_api_key_ref": "string",  "voice_settings": {    "voice": "string",    "voice_speed": 1,    "api_key_ref": "string",    "background_audio": {      "type": "predefined_media",      "value": "silence"    }  },  "transcription": {    "model": "deepgram/flux",    "language": "string",    "region": "string",    "settings": {      "smart_format": true,      "numerals": true,      "eot_threshold": 0,      "eot_timeout_ms": 0    }  },  "telephony_settings": {    "default_texml_app_id": "string",    "supports_unauthenticated_web_calls": true  },  "messaging_settings": {    "default_messaging_profile_id": "string",    "delivery_status_webhook_url": "string"  },  "enabled_features": [    "telephony"  ],  "insight_settings": {    "insight_group_id": "string"  },  "privacy_settings": {    "data_retention": true  },  "dynamic_variables_webhook_url": "string",  "dynamic_variables": {},  "promote_to_main": true}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "name": "string",  "model": "string",  "instructions": "string",  "tools": [    {      "type": "webhook",      "webhook": {        "name": "string",        "description": "string",        "url": "https://example.com/api/v1/function",        "method": "POST",        "headers": [          {            "name": "string",            "value": "string"          }        ],        "body_parameters": {          "properties": {            "age": {              "description": "The age of the customer.",              "type": "integer"            },            "location": {              "description": "The location of the customer.",              "type": "string"            }          },          "required": [            "age",            "location"          ],          "type": "object"        },        "path_parameters": {          "properties": {            "id": {              "description": "The id of the customer.",              "type": "string"            }          },          "required": [            "id"          ],          "type": "object"        },        "query_parameters": {          "properties": {            "page": {              "description": "The page number.",              "type": "integer"            }          },          "required": [            "page"          ],          "type": "object"        }      }    },    {      "type": "retrieval",      "retrieval": {        "bucket_ids": [          "string"        ],        "max_num_results": 0      }    },    {      "type": "handoff",      "handoff": {        "voice_mode": "unified",        "ai_assistants": [          {            "name": "Scheduling Specialist",            "id": "assistant-1234567890abcdef"          }        ]      }    },    {      "type": "hangup",      "hangup": {        "description": "This tool is used to hang up the call."      }    },    {      "type": "transfer",      "transfer": {        "targets": [          {            "name": "Support",            "to": "+13129457420"          }        ],        "from": "+35319605860",        "warm_transfer_instructions": "Briefly greet the transfer recipient and provide any relevant information from the call. Let them know you will bridge the call right after.",        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "refer",      "refer": {        "targets": [          {            "name": "Support",            "sip_address": "sip:username@sip.non-telnyx-address.com",            "sip_auth_username": "string",            "sip_auth_password": "string"          }        ],        "sip_headers": [          {            "name": "User-to-User",            "value": "string"          }        ],        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "send_dtmf",      "send_dtmf": {}    }  ],  "description": "string",  "greeting": "string",  "llm_api_key_ref": "string",  "voice_settings": {    "voice": "string",    "voice_speed": 1,    "api_key_ref": "string",    "background_audio": {      "type": "predefined_media",      "value": "silence"    }  },  "transcription": {    "model": "deepgram/flux",    "language": "string",    "region": "string",    "settings": {      "smart_format": true,      "numerals": true,      "eot_threshold": 0,      "eot_timeout_ms": 0    }  },  "telephony_settings": {    "default_texml_app_id": "string",    "supports_unauthenticated_web_calls": true  },  "messaging_settings": {    "default_messaging_profile_id": "string",    "delivery_status_webhook_url": "string"  },  "enabled_features": [    "telephony"  ],  "insight_settings": {    "insight_group_id": "string"  },  "privacy_settings": {    "data_retention": true  },  "dynamic_variables_webhook_url": "string",  "dynamic_variables": {},  "promote_to_main": true}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "name": "string",  "model": "string",  "instructions": "string",  "tools": [    {      "type": "webhook",      "webhook": {        "name": "string",        "description": "string",        "url": "https://example.com/api/v1/function",        "method": "POST",        "headers": [          {            "name": "string",            "value": "string"          }        ],        "body_parameters": {          "properties": {            "age": {              "description": "The age of the customer.",              "type": "integer"            },            "location": {              "description": "The location of the customer.",              "type": "string"            }          },          "required": [            "age",            "location"          ],          "type": "object"        },        "path_parameters": {          "properties": {            "id": {              "description": "The id of the customer.",              "type": "string"            }          },          "required": [            "id"          ],          "type": "object"        },        "query_parameters": {          "properties": {            "page": {              "description": "The page number.",              "type": "integer"            }          },          "required": [            "page"          ],          "type": "object"        }      }    },    {      "type": "retrieval",      "retrieval": {        "bucket_ids": [          "string"        ],        "max_num_results": 0      }    },    {      "type": "handoff",      "handoff": {        "voice_mode": "unified",        "ai_assistants": [          {            "name": "Scheduling Specialist",            "id": "assistant-1234567890abcdef"          }        ]      }    },    {      "type": "hangup",      "hangup": {        "description": "This tool is used to hang up the call."      }    },    {      "type": "transfer",      "transfer": {        "targets": [          {            "name": "Support",            "to": "+13129457420"          }        ],        "from": "+35319605860",        "warm_transfer_instructions": "Briefly greet the transfer recipient and provide any relevant information from the call. Let them know you will bridge the call right after.",        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "refer",      "refer": {        "targets": [          {            "name": "Support",            "sip_address": "sip:username@sip.non-telnyx-address.com",            "sip_auth_username": "string",            "sip_auth_password": "string"          }        ],        "sip_headers": [          {            "name": "User-to-User",            "value": "string"          }        ],        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "send_dtmf",      "send_dtmf": {}    }  ],  "description": "string",  "greeting": "string",  "llm_api_key_ref": "string",  "voice_settings": {    "voice": "string",    "voice_speed": 1,    "api_key_ref": "string",    "background_audio": {      "type": "predefined_media",      "value": "silence"    }  },  "transcription": {    "model": "deepgram/flux",    "language": "string",    "region": "string",    "settings": {      "smart_format": true,      "numerals": true,      "eot_threshold": 0,      "eot_timeout_ms": 0    }  },  "telephony_settings": {    "default_texml_app_id": "string",    "supports_unauthenticated_web_calls": true  },  "messaging_settings": {    "default_messaging_profile_id": "string",    "delivery_status_webhook_url": "string"  },  "enabled_features": [    "telephony"  ],  "insight_settings": {    "insight_group_id": "string"  },  "privacy_settings": {    "data_retention": true  },  "dynamic_variables_webhook_url": "string",  "dynamic_variables": {},  "promote_to_main": true}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "name": "string",  "model": "string",  "instructions": "string",  "tools": [    {      "type": "webhook",      "webhook": {        "name": "string",        "description": "string",        "url": "https://example.com/api/v1/function",        "method": "POST",        "headers": [          {            "name": "string",            "value": "string"          }        ],        "body_parameters": {          "properties": {            "age": {              "description": "The age of the customer.",              "type": "integer"            },            "location": {              "description": "The location of the customer.",              "type": "string"            }          },          "required": [            "age",            "location"          ],          "type": "object"        },        "path_parameters": {          "properties": {            "id": {              "description": "The id of the customer.",              "type": "string"            }          },          "required": [            "id"          ],          "type": "object"        },        "query_parameters": {          "properties": {            "page": {              "description": "The page number.",              "type": "integer"            }          },          "required": [            "page"          ],          "type": "object"        }      }    },    {      "type": "retrieval",      "retrieval": {        "bucket_ids": [          "string"        ],        "max_num_results": 0      }    },    {      "type": "handoff",      "handoff": {        "voice_mode": "unified",        "ai_assistants": [          {            "name": "Scheduling Specialist",            "id": "assistant-1234567890abcdef"          }        ]      }    },    {      "type": "hangup",      "hangup": {        "description": "This tool is used to hang up the call."      }    },    {      "type": "transfer",      "transfer": {        "targets": [          {            "name": "Support",            "to": "+13129457420"          }        ],        "from": "+35319605860",        "warm_transfer_instructions": "Briefly greet the transfer recipient and provide any relevant information from the call. Let them know you will bridge the call right after.",        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "refer",      "refer": {        "targets": [          {            "name": "Support",            "sip_address": "sip:username@sip.non-telnyx-address.com",            "sip_auth_username": "string",            "sip_auth_password": "string"          }        ],        "sip_headers": [          {            "name": "User-to-User",            "value": "string"          }        ],        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "send_dtmf",      "send_dtmf": {}    }  ],  "description": "string",  "greeting": "string",  "llm_api_key_ref": "string",  "voice_settings": {    "voice": "string",    "voice_speed": 1,    "api_key_ref": "string",    "background_audio": {      "type": "predefined_media",      "value": "silence"    }  },  "transcription": {    "model": "deepgram/flux",    "language": "string",    "region": "string",    "settings": {      "smart_format": true,      "numerals": true,      "eot_threshold": 0,      "eot_timeout_ms": 0    }  },  "telephony_settings": {    "default_texml_app_id": "string",    "supports_unauthenticated_web_calls": true  },  "messaging_settings": {    "default_messaging_profile_id": "string",    "delivery_status_webhook_url": "string"  },  "enabled_features": [    "telephony"  ],  "insight_settings": {    "insight_group_id": "string"  },  "privacy_settings": {    "data_retention": true  },  "dynamic_variables_webhook_url": "string",  "dynamic_variables": {},  "promote_to_main": true}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "name": "string",  "model": "string",  "instructions": "string",  "tools": [    {      "type": "webhook",      "webhook": {        "name": "string",        "description": "string",        "url": "https://example.com/api/v1/function",        "method": "POST",        "headers": [          {            "name": "string",            "value": "string"          }        ],        "body_parameters": {          "properties": {            "age": {              "description": "The age of the customer.",              "type": "integer"            },            "location": {              "description": "The location of the customer.",              "type": "string"            }          },          "required": [            "age",            "location"          ],          "type": "object"        },        "path_parameters": {          "properties": {            "id": {              "description": "The id of the customer.",              "type": "string"            }          },          "required": [            "id"          ],          "type": "object"        },        "query_parameters": {          "properties": {            "page": {              "description": "The page number.",              "type": "integer"            }          },          "required": [            "page"          ],          "type": "object"        }      }    },    {      "type": "retrieval",      "retrieval": {        "bucket_ids": [          "string"        ],        "max_num_results": 0      }    },    {      "type": "handoff",      "handoff": {        "voice_mode": "unified",        "ai_assistants": [          {            "name": "Scheduling Specialist",            "id": "assistant-1234567890abcdef"          }        ]      }    },    {      "type": "hangup",      "hangup": {        "description": "This tool is used to hang up the call."      }    },    {      "type": "transfer",      "transfer": {        "targets": [          {            "name": "Support",            "to": "+13129457420"          }        ],        "from": "+35319605860",        "warm_transfer_instructions": "Briefly greet the transfer recipient and provide any relevant information from the call. Let them know you will bridge the call right after.",        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "refer",      "refer": {        "targets": [          {            "name": "Support",            "sip_address": "sip:username@sip.non-telnyx-address.com",            "sip_auth_username": "string",            "sip_auth_password": "string"          }        ],        "sip_headers": [          {            "name": "User-to-User",            "value": "string"          }        ],        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "send_dtmf",      "send_dtmf": {}    }  ],  "description": "string",  "greeting": "string",  "llm_api_key_ref": "string",  "voice_settings": {    "voice": "string",    "voice_speed": 1,    "api_key_ref": "string",    "background_audio": {      "type": "predefined_media",      "value": "silence"    }  },  "transcription": {    "model": "deepgram/flux",    "language": "string",    "region": "string",    "settings": {      "smart_format": true,      "numerals": true,      "eot_threshold": 0,      "eot_timeout_ms": 0    }  },  "telephony_settings": {    "default_texml_app_id": "string",    "supports_unauthenticated_web_calls": true  },  "messaging_settings": {    "default_messaging_profile_id": "string",    "delivery_status_webhook_url": "string"  },  "enabled_features": [    "telephony"  ],  "insight_settings": {    "insight_group_id": "string"  },  "privacy_settings": {    "data_retention": true  },  "dynamic_variables_webhook_url": "string",  "dynamic_variables": {},  "promote_to_main": true}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "name": "string",  "model": "string",  "instructions": "string",  "tools": [    {      "type": "webhook",      "webhook": {        "name": "string",        "description": "string",        "url": "https://example.com/api/v1/function",        "method": "POST",        "headers": [          {            "name": "string",            "value": "string"          }        ],        "body_parameters": {          "properties": {            "age": {              "description": "The age of the customer.",              "type": "integer"            },            "location": {              "description": "The location of the customer.",              "type": "string"            }          },          "required": [            "age",            "location"          ],          "type": "object"        },        "path_parameters": {          "properties": {            "id": {              "description": "The id of the customer.",              "type": "string"            }          },          "required": [            "id"          ],          "type": "object"        },        "query_parameters": {          "properties": {            "page": {              "description": "The page number.",              "type": "integer"            }          },          "required": [            "page"          ],          "type": "object"        }      }    },    {      "type": "retrieval",      "retrieval": {        "bucket_ids": [          "string"        ],        "max_num_results": 0      }    },    {      "type": "handoff",      "handoff": {        "voice_mode": "unified",        "ai_assistants": [          {            "name": "Scheduling Specialist",            "id": "assistant-1234567890abcdef"          }        ]      }    },    {      "type": "hangup",      "hangup": {        "description": "This tool is used to hang up the call."      }    },    {      "type": "transfer",      "transfer": {        "targets": [          {            "name": "Support",            "to": "+13129457420"          }        ],        "from": "+35319605860",        "warm_transfer_instructions": "Briefly greet the transfer recipient and provide any relevant information from the call. Let them know you will bridge the call right after.",        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "refer",      "refer": {        "targets": [          {            "name": "Support",            "sip_address": "sip:username@sip.non-telnyx-address.com",            "sip_auth_username": "string",            "sip_auth_password": "string"          }        ],        "sip_headers": [          {            "name": "User-to-User",            "value": "string"          }        ],        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "send_dtmf",      "send_dtmf": {}    }  ],  "description": "string",  "greeting": "string",  "llm_api_key_ref": "string",  "voice_settings": {    "voice": "string",    "voice_speed": 1,    "api_key_ref": "string",    "background_audio": {      "type": "predefined_media",      "value": "silence"    }  },  "transcription": {    "model": "deepgram/flux",    "language": "string",    "region": "string",    "settings": {      "smart_format": true,      "numerals": true,      "eot_threshold": 0,      "eot_timeout_ms": 0    }  },  "telephony_settings": {    "default_texml_app_id": "string",    "supports_unauthenticated_web_calls": true  },  "messaging_settings": {    "default_messaging_profile_id": "string",    "delivery_status_webhook_url": "string"  },  "enabled_features": [    "telephony"  ],  "insight_settings": {    "insight_group_id": "string"  },  "privacy_settings": {    "data_retention": true  },  "dynamic_variables_webhook_url": "string",  "dynamic_variables": {},  "promote_to_main": true}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "name": "string",  "model": "string",  "instructions": "string",  "tools": [    {      "type": "webhook",      "webhook": {        "name": "string",        "description": "string",        "url": "https://example.com/api/v1/function",        "method": "POST",        "headers": [          {            "name": "string",            "value": "string"          }        ],        "body_parameters": {          "properties": {            "age": {              "description": "The age of the customer.",              "type": "integer"            },            "location": {              "description": "The location of the customer.",              "type": "string"            }          },          "required": [            "age",            "location"          ],          "type": "object"        },        "path_parameters": {          "properties": {            "id": {              "description": "The id of the customer.",              "type": "string"            }          },          "required": [            "id"          ],          "type": "object"        },        "query_parameters": {          "properties": {            "page": {              "description": "The page number.",              "type": "integer"            }          },          "required": [            "page"          ],          "type": "object"        }      }    },    {      "type": "retrieval",      "retrieval": {        "bucket_ids": [          "string"        ],        "max_num_results": 0      }    },    {      "type": "handoff",      "handoff": {        "voice_mode": "unified",        "ai_assistants": [          {            "name": "Scheduling Specialist",            "id": "assistant-1234567890abcdef"          }        ]      }    },    {      "type": "hangup",      "hangup": {        "description": "This tool is used to hang up the call."      }    },    {      "type": "transfer",      "transfer": {        "targets": [          {            "name": "Support",            "to": "+13129457420"          }        ],        "from": "+35319605860",        "warm_transfer_instructions": "Briefly greet the transfer recipient and provide any relevant information from the call. Let them know you will bridge the call right after.",        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "refer",      "refer": {        "targets": [          {            "name": "Support",            "sip_address": "sip:username@sip.non-telnyx-address.com",            "sip_auth_username": "string",            "sip_auth_password": "string"          }        ],        "sip_headers": [          {            "name": "User-to-User",            "value": "string"          }        ],        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "send_dtmf",      "send_dtmf": {}    }  ],  "description": "string",  "greeting": "string",  "llm_api_key_ref": "string",  "voice_settings": {    "voice": "string",    "voice_speed": 1,    "api_key_ref": "string",    "background_audio": {      "type": "predefined_media",      "value": "silence"    }  },  "transcription": {    "model": "deepgram/flux",    "language": "string",    "region": "string",    "settings": {      "smart_format": true,      "numerals": true,      "eot_threshold": 0,      "eot_timeout_ms": 0    }  },  "telephony_settings": {    "default_texml_app_id": "string",    "supports_unauthenticated_web_calls": true  },  "messaging_settings": {    "default_messaging_profile_id": "string",    "delivery_status_webhook_url": "string"  },  "enabled_features": [    "telephony"  ],  "insight_settings": {    "insight_group_id": "string"  },  "privacy_settings": {    "data_retention": true  },  "dynamic_variables_webhook_url": "string",  "dynamic_variables": {},  "promote_to_main": true}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "name": "string",  "model": "string",  "instructions": "string",  "tools": [    {      "type": "webhook",      "webhook": {        "name": "string",        "description": "string",        "url": "https://example.com/api/v1/function",        "method": "POST",        "headers": [          {            "name": "string",            "value": "string"          }        ],        "body_parameters": {          "properties": {            "age": {              "description": "The age of the customer.",              "type": "integer"            },            "location": {              "description": "The location of the customer.",              "type": "string"            }          },          "required": [            "age",            "location"          ],          "type": "object"        },        "path_parameters": {          "properties": {            "id": {              "description": "The id of the customer.",              "type": "string"            }          },          "required": [            "id"          ],          "type": "object"        },        "query_parameters": {          "properties": {            "page": {              "description": "The page number.",              "type": "integer"            }          },          "required": [            "page"          ],          "type": "object"        }      }    },    {      "type": "retrieval",      "retrieval": {        "bucket_ids": [          "string"        ],        "max_num_results": 0      }    },    {      "type": "handoff",      "handoff": {        "voice_mode": "unified",        "ai_assistants": [          {            "name": "Scheduling Specialist",            "id": "assistant-1234567890abcdef"          }        ]      }    },    {      "type": "hangup",      "hangup": {        "description": "This tool is used to hang up the call."      }    },    {      "type": "transfer",      "transfer": {        "targets": [          {            "name": "Support",            "to": "+13129457420"          }        ],        "from": "+35319605860",        "warm_transfer_instructions": "Briefly greet the transfer recipient and provide any relevant information from the call. Let them know you will bridge the call right after.",        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "refer",      "refer": {        "targets": [          {            "name": "Support",            "sip_address": "sip:username@sip.non-telnyx-address.com",            "sip_auth_username": "string",            "sip_auth_password": "string"          }        ],        "sip_headers": [          {            "name": "User-to-User",            "value": "string"          }        ],        "custom_headers": [          {            "name": "string",            "value": "string"          }        ]      }    },    {      "type": "send_dtmf",      "send_dtmf": {}    }  ],  "description": "string",  "greeting": "string",  "llm_api_key_ref": "string",  "voice_settings": {    "voice": "string",    "voice_speed": 1,    "api_key_ref": "string",    "background_audio": {      "type": "predefined_media",      "value": "silence"    }  },  "transcription": {    "model": "deepgram/flux",    "language": "string",    "region": "string",    "settings": {      "smart_format": true,      "numerals": true,      "eot_threshold": 0,      "eot_timeout_ms": 0    }  },  "telephony_settings": {    "default_texml_app_id": "string",    "supports_unauthenticated_web_calls": true  },  "messaging_settings": {    "default_messaging_profile_id": "string",    "delivery_status_webhook_url": "string"  },  "enabled_features": [    "telephony"  ],  "insight_settings": {    "insight_group_id": "string"  },  "privacy_settings": {    "data_retention": true  },  "dynamic_variables_webhook_url": "string",  "dynamic_variables": {},  "promote_to_main": true}'
```

## Response samples
```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Delete an assistant

Delete an AI Assistant by `assistant_id`.

Delete an assistant API{"@context":"http://schema.org","@type":"TechArticle","headline":"Delete an assistant API","description":"Delete an AI Assistant by `assistant_id`.","url":"https://developers.telnyx.com/api/inference/inference-embedding/delete-assistant-public-assistants-assistant-id-delete","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownDelete an assistant
DELETE https://api.telnyx.com/v2/ai/assistants/:assistant_id
Delete an AI Assistant by `assistant_id` .
Request ​
Responses ​200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `assistant_id` (Assistant Id) [required]

## Response

## Response Schema - id
- `id` (Id (string)) [required]
- `object` (Object (string)) [required]
- `deleted` (Deleted (boolean)) [required]

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/assistants/:assistant_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "id": "string",  "object": "string",  "deleted": true}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Test Assistant Tool

Test a webhook tool for an assistant

Test Assistant Tool API{"@context":"http://schema.org","@type":"TechArticle","headline":"Test Assistant Tool API","description":"Test a webhook tool for an assistant","url":"https://developers.telnyx.com/api/inference/inference-embedding/test-assistant-tool-public-assistants-assistant-id-tools-tool-id-test-post","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownTest Assistant Tool
POST https://api.telnyx.com/v2/ai/assistants/:assistant_id/tools/:tool_id/test
Test a webhook tool for an assistant
Request ​
Responses ​200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `assistant_id` (Assistant Id) [required]
- `tool_id` (Tool Id) [required]

## Request Body
- `arguments` (object): Key-value arguments to use for the webhook test
  - `property name*` (any): Key-value arguments to use for the webhook test
- `dynamic_variables` (object): Key-value dynamic variables to use for the webhook test
  - `property name*` (any): Key-value dynamic variables to use for the webhook test

## Response

## Response Schema - data
- `data` (object) [required]: Response model for webhook tool test results
  - `success` (Success (boolean)) [required]
  - `status_code` (Status Code (integer)) [required]
  - `content_type` (Content Type (string)) [required]
  - `response` (Response (string)) [required]
  - `request` (object) [required]
    - `property name*` (any)

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id/tools/:tool_id/test' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "arguments": {},  "dynamic_variables": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id/tools/:tool_id/test' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "arguments": {},  "dynamic_variables": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id/tools/:tool_id/test' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "arguments": {},  "dynamic_variables": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id/tools/:tool_id/test' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "arguments": {},  "dynamic_variables": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id/tools/:tool_id/test' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "arguments": {},  "dynamic_variables": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id/tools/:tool_id/test' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "arguments": {},  "dynamic_variables": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id/tools/:tool_id/test' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "arguments": {},  "dynamic_variables": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id/tools/:tool_id/test' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "arguments": {},  "dynamic_variables": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id/tools/:tool_id/test' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "arguments": {},  "dynamic_variables": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id/tools/:tool_id/test' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "arguments": {},  "dynamic_variables": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id/tools/:tool_id/test' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "arguments": {},  "dynamic_variables": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id/tools/:tool_id/test' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "arguments": {},  "dynamic_variables": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id/tools/:tool_id/test' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "arguments": {},  "dynamic_variables": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/assistants/:assistant_id/tools/:tool_id/test' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "arguments": {},  "dynamic_variables": {}}'
```

## Response samples
```
{  "data": {    "success": true,    "status_code": 0,    "content_type": "string",    "response": "string",    "request": {}  }}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Transcribe speech to text

Transcribe speech to text. This endpoint is consistent with the [OpenAI Transcription API](https://platform.openai.com/docs/api-reference/audio/createTranscription) and may be used with the OpenAI JS or Python SDK.

Transcribe speech to text API{"@context":"http://schema.org","@type":"TechArticle","headline":"Transcribe speech to text API","description":"Transcribe speech to text. This endpoint is consistent with the [OpenAI Transcription API](https://platform.openai.com/docs/api-reference/audio/createTranscription) and may be used with the OpenAI JS or Python SDK.","url":"https://developers.telnyx.com/api/inference/inference-embedding/audio-public-audio-transcriptions-post","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownTranscribe speech to text
POST https://api.telnyx.com/v2/ai/audio/transcriptions
Transcribe speech to text. This endpoint is consistent with the OpenAI Transcription API and may be used with the OpenAI JS or Python SDK.
Request ​
Responses ​200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Request Body
- `file` (string<binary>): The audio file object to transcribe, in one of these formats: flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, or webm. File uploads are limited to 100 MB. Cannot be used together with file_url
- `file_url` (string): Link to audio file in one of these formats: flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, or webm. Support for hosted files is limited to 100MB. Cannot be used together with file
- `model` (string) [required]: *Possible values:* [`distil-whisper/distil-large-v2` , `openai/whisper-large-v3-turbo` ] *Default value:* `distil-whisper/distil-large-v2` ID of the model to use. distil-whisper/distil-large-v2 is lower latency but English-only. openai/whisper-large-v3-turbo is multi-lingual but slightly higher latency.
- `response_format` (string): *Possible values:* [`json` , `verbose_json` ] *Default value:* `json` The format of the transcript output. Use verbose_json to take advantage of timestamps.
- `timestamp_granularities[]` (string): *Possible values:* [`segment` ]The timestamp granularities to populate for this transcription. response_format must be set verbose_json to use timestamp granularities. Currently segment is supported.

## Response

## Response Schema - text
- `text` (string) [required]: The transcribed text for the audio file.
- `duration` (number): The duration of the audio file in seconds. This is only included if response_format is set to verbose_json .
- `segments` (object[]) [required]: Segments of the transcribed text and their corresponding details. This is only included if `response_format` is set to `verbose_json` .Array []
  - `id` (number) [required]: Unique identifier of the segment.
  - `start` (number) [required]: Start time of the segment in seconds.
  - `end` (number) [required]: End time of the segment in seconds.
  - `text` (string) [required]: Text content of the segment.

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L -X POST 'https://api.telnyx.com/v2/ai/audio/transcriptions' \-H 'Content-Type: multipart/form-data' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/ai/audio/transcriptions' \-H 'Content-Type: multipart/form-data' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/ai/audio/transcriptions' \-H 'Content-Type: multipart/form-data' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/ai/audio/transcriptions' \-H 'Content-Type: multipart/form-data' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/ai/audio/transcriptions' \-H 'Content-Type: multipart/form-data' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/ai/audio/transcriptions' \-H 'Content-Type: multipart/form-data' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/ai/audio/transcriptions' \-H 'Content-Type: multipart/form-data' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/ai/audio/transcriptions' \-H 'Content-Type: multipart/form-data' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/ai/audio/transcriptions' \-H 'Content-Type: multipart/form-data' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/ai/audio/transcriptions' \-H 'Content-Type: multipart/form-data' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/ai/audio/transcriptions' \-H 'Content-Type: multipart/form-data' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/ai/audio/transcriptions' \-H 'Content-Type: multipart/form-data' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/ai/audio/transcriptions' \-H 'Content-Type: multipart/form-data' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/ai/audio/transcriptions' \-H 'Content-Type: multipart/form-data' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "text": "string",  "duration": 0,  "segments": [    {      "id": 0,      "start": 0,      "end": 0,      "text": "string"    }  ]}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Create a conversation

Create a new AI Conversation.

Create a conversation API{"@context":"http://schema.org","@type":"TechArticle","headline":"Create a conversation API","description":"Create a new AI Conversation.","url":"https://developers.telnyx.com/api/inference/inference-embedding/create-new-conversation-public-conversations-post","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownCreate a conversation
POST https://api.telnyx.com/v2/ai/conversations
Create a new AI Conversation.
Request ​
Responses ​200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Request Body
- `name` (string)
- `metadata` (object): Metadata associated with the conversation.
  - `property name*` (string)

## Response

## Response Schema - id
- `id` (string<uuid>) [required]
- `name` (string)
- `created_at` (string<date-time>) [required]: The datetime the conversation was created.
- `metadata` (object) [required]: Metadata associated with the conversation. Telnyx provides several pieces of metadata, but customers can also add their own.
  - `property name*` (string)
- `last_message_at` (string<date-time>) [required]: The datetime of the latest message in the conversation.

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "name": "string",  "metadata": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "name": "string",  "metadata": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "name": "string",  "metadata": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "name": "string",  "metadata": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "name": "string",  "metadata": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "name": "string",  "metadata": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "name": "string",  "metadata": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "name": "string",  "metadata": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "name": "string",  "metadata": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "name": "string",  "metadata": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "name": "string",  "metadata": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "name": "string",  "metadata": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "name": "string",  "metadata": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "name": "string",  "metadata": {}}'
```

## Response samples
```
{  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",  "name": "",  "created_at": "2025-04-15T13:07:28.764Z",  "metadata": {    "telnyx_conversation_channel": "phone_call",    "telnyx_agent_target": "+13128675309",    "telnyx_end_user_target": "+13128675309",    "assistant_id": "assistant-123"  },  "last_message_at": "2025-04-15T13:07:28.764Z"}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```
# List conversations

Retrieve a list of all AI conversations configured by the user. Supports [PostgREST-style query parameters](https://postgrest.org/en/stable/api.html#horizontal-filtering-rows) for filtering. Examples are included for the standard metadata fields, but you can filter on any field in the metadata JSON object. For example, to filter by a custom field `metadata->custom_field`, use `metadata->custom_field=eq.value`.

List conversations API{"@context":"http://schema.org","@type":"TechArticle","headline":"List conversations API","description":"Retrieve a list of all AI conversations configured by the user. Supports [PostgREST-style query parameters](https://postgrest.org/en/stable/api.html#horizontal-filtering-rows) for filtering. Examples are included for the standard metadata fields, but you can filter on any field in the metadata JSON object. For example, to filter by a custom field `metadata->custom_field`, use `metadata->custom_field=eq.value`.","url":"https://developers.telnyx.com/api/inference/inference-embedding/get-conversations-public-conversations-get","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownList conversations
GET https://api.telnyx.com/v2/ai/conversations
Retrieve a list of all AI conversations configured by the user. Supports PostgREST-style query parameters for filtering. Examples are included for the standard metadata fields, but you can filter on any field in the metadata JSON object. For example, to filter by a custom field `metadata->custom_field` , use `metadata->custom_field=eq.value` .
Request ​
Responses ​200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Query Parameters
- `id` (string): Filter by conversation ID (e.g. id=eq.123)
- `name` (string): Filter by conversation Name (e.g. name=like.Voice% )
- `created_at` (string): Filter by creation datetime (e.g., created_at=gte.2025-01-01 )
- `last_message_at` (string): Filter by last message datetime (e.g., last_message_at=lte.2025-06-01 )
- `metadata->assistant_id` (string): Filter by assistant ID (e.g., metadata->assistant_id=eq.assistant-123 )
- `metadata->call_control_id` (string): Filter by call control ID (e.g., metadata->call_control_id=eq.v3:123 )
- `metadata->telnyx_agent_target` (string): Filter by the phone number, SIP URI, or other identifier for the agent (e.g., metadata->telnyx_agent_target=eq.+13128675309 )
- `metadata->telnyx_end_user_target` (string): Filter by the phone number, SIP URI, or other identifier for the end user (e.g., metadata->telnyx_end_user_target=eq.+13128675309 )
- `metadata->telnyx_conversation_channel` (string): Filter by conversation channel (e.g., metadata->telnyx_conversation_channel=eq.phone_call )
- `limit` (integer): *Possible values:* `>= 1` Limit the number of returned conversations (e.g., limit=10 )
- `order` (string): Order the results by specific fields (e.g., order=created_at.desc or order=last_message_at.asc )
- `or` (string): Apply OR conditions using PostgREST syntax (e.g., or=(created_at.gte.2025-04-01,last_message_at.gte.2025-04-01) )

## Response

## Response Schema - data
- `data` (object[]) [required]: Array []
  - `id` (string<uuid>) [required]
  - `name` (string)
  - `created_at` (string<date-time>) [required]: The datetime the conversation was created.
  - `metadata` (object) [required]: Metadata associated with the conversation. Telnyx provides several pieces of metadata, but customers can also add their own.
    - `property name*` (string)
  - `last_message_at` (string<date-time>) [required]: The datetime of the latest message in the conversation.

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "data": [    {      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",      "name": "",      "created_at": "2025-04-15T13:07:28.764Z",      "metadata": {        "telnyx_conversation_channel": "phone_call",        "telnyx_agent_target": "+13128675309",        "telnyx_end_user_target": "+13128675309",        "assistant_id": "assistant-123"      },      "last_message_at": "2025-04-15T13:07:28.764Z"    }  ]}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```
# Get a conversation

Retrieve a specific AI conversation by its ID.

Get a conversation API{"@context":"http://schema.org","@type":"TechArticle","headline":"Get a conversation API","description":"Retrieve a specific AI conversation by its ID.","url":"https://developers.telnyx.com/api/inference/inference-embedding/get-conversation-by-id-public-conversations-get","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownGet a conversation
GET https://api.telnyx.com/v2/ai/conversations/:conversation_id
Retrieve a specific AI conversation by its ID.
Request ​
Responses ​200: Successful ResponseSchema SchemaExample (auto)404: Conversation Not Found422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `conversation_id` (string) [required]: The ID of the conversation to retrieve

## Response

## Response Schema - data
- `data` (object) [required]
  - `id` (string<uuid>) [required]
  - `name` (string)
  - `created_at` (string<date-time>) [required]: The datetime the conversation was created.
  - `metadata` (object) [required]: Metadata associated with the conversation. Telnyx provides several pieces of metadata, but customers can also add their own.
    - `property name*` (string)
  - `last_message_at` (string<date-time>) [required]: The datetime of the latest message in the conversation.

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "data": {    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",    "name": "",    "created_at": "2025-04-15T13:07:28.764Z",    "metadata": {      "telnyx_conversation_channel": "phone_call",      "telnyx_agent_target": "+13128675309",      "telnyx_end_user_target": "+13128675309",      "assistant_id": "assistant-123"    },    "last_message_at": "2025-04-15T13:07:28.764Z"  }}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```
# Update conversation metadata

Update metadata for a specific conversation.

Update conversation metadata API{"@context":"http://schema.org","@type":"TechArticle","headline":"Update conversation metadata API","description":"Update metadata for a specific conversation.","url":"https://developers.telnyx.com/api/inference/inference-embedding/update-conversation-by-id-public-conversations-put","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownUpdate conversation metadata
PUT https://api.telnyx.com/v2/ai/conversations/:conversation_id
Update metadata for a specific conversation.
Request ​
Responses ​200: Successful UpdateSchema SchemaExample (auto)404: Conversation Not Found422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `conversation_id` (string) [required]: The ID of the conversation to update

## Request Body
- `metadata` (object): Metadata associated with the conversation.
  - `property name*` (string)

## Response

## Response Schema - data
- `data` (object) [required]
  - `id` (string<uuid>) [required]
  - `name` (string)
  - `created_at` (string<date-time>) [required]: The datetime the conversation was created.
  - `metadata` (object) [required]: Metadata associated with the conversation. Telnyx provides several pieces of metadata, but customers can also add their own.
    - `property name*` (string)
  - `last_message_at` (string<date-time>) [required]: The datetime of the latest message in the conversation.

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L -X PUT 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "metadata": {}}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "metadata": {}}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "metadata": {}}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "metadata": {}}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "metadata": {}}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "metadata": {}}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "metadata": {}}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "metadata": {}}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "metadata": {}}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "metadata": {}}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "metadata": {}}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "metadata": {}}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "metadata": {}}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "metadata": {}}'
```

## Response samples
```
{  "data": {    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",    "name": "",    "created_at": "2025-04-15T13:07:28.764Z",    "metadata": {      "telnyx_conversation_channel": "phone_call",      "telnyx_agent_target": "+13128675309",      "telnyx_end_user_target": "+13128675309",      "assistant_id": "assistant-123"    },    "last_message_at": "2025-04-15T13:07:28.764Z"  }}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```
# Delete a conversation

Delete a specific conversation by its ID.

Delete a conversation API{"@context":"http://schema.org","@type":"TechArticle","headline":"Delete a conversation API","description":"Delete a specific conversation by its ID.","url":"https://developers.telnyx.com/api/inference/inference-embedding/delete-conversation-by-id-public-conversations-delete","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownDelete a conversation
DELETE https://api.telnyx.com/v2/ai/conversations/:conversation_id
Delete a specific conversation by its ID.
Request ​
Responses ​200: Successful Response404: Conversation Not Found422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `conversation_id` (string) [required]: The ID of the conversation to delete

## Response

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/ai/conversations/:conversation_id' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```
# Create Message

Add a new message to the conversation. Used to insert a new messages to a conversation manually ( without using chat endpoint )

Create Message API{"@context":"http://schema.org","@type":"TechArticle","headline":"Create Message API","description":"Add a new message to the conversation. Used to insert a new messages to a conversation manually ( without using chat endpoint )","url":"https://developers.telnyx.com/api/inference/inference-embedding/add-new-message","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownCreate Message
POST https://api.telnyx.com/v2/ai/conversations/:conversation_id/message
Add a new message to the conversation. Used to insert a new messages to a conversation manually ( without using chat endpoint )
Request ​
Responses ​200: Successful ResponseSchema Schema422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `conversation_id` (uuid) [required]: The ID of the conversation

## Request Body
- `role` (Role (string)) [required]
- `content` (Content (string))
- `name` (Name (string))
- `tool_choice` (object): anyOfstring stringToolChoiceObject
  - `[item]` (string)
  - `[item]` (object)
- `tool_calls` (object[])
- `tool_call_id` (Tool Call Id (string))
- `sent_at` (string<date-time>)
- `metadata` (object)
  - `property name*` (object): anyOfstring stringintegerbooleanarrayArray [anyOfstring stringintegerboolean]
    - `[item]` (string)
    - `[item]` (integer)
    - `[item]` (boolean)
    - `[item]` (string)
    - `[item]` (integer)
    - `[item]` (boolean)

## Response

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/message' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "role": "string",  "content": "",  "name": "string",  "tool_choice": "string",  "tool_calls": [    {}  ],  "tool_call_id": "string",  "sent_at": "2024-07-29T15:51:28.071Z",  "metadata": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/message' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "role": "string",  "content": "",  "name": "string",  "tool_choice": "string",  "tool_calls": [    {}  ],  "tool_call_id": "string",  "sent_at": "2024-07-29T15:51:28.071Z",  "metadata": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/message' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "role": "string",  "content": "",  "name": "string",  "tool_choice": "string",  "tool_calls": [    {}  ],  "tool_call_id": "string",  "sent_at": "2024-07-29T15:51:28.071Z",  "metadata": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/message' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "role": "string",  "content": "",  "name": "string",  "tool_choice": "string",  "tool_calls": [    {}  ],  "tool_call_id": "string",  "sent_at": "2024-07-29T15:51:28.071Z",  "metadata": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/message' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "role": "string",  "content": "",  "name": "string",  "tool_choice": "string",  "tool_calls": [    {}  ],  "tool_call_id": "string",  "sent_at": "2024-07-29T15:51:28.071Z",  "metadata": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/message' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "role": "string",  "content": "",  "name": "string",  "tool_choice": "string",  "tool_calls": [    {}  ],  "tool_call_id": "string",  "sent_at": "2024-07-29T15:51:28.071Z",  "metadata": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/message' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "role": "string",  "content": "",  "name": "string",  "tool_choice": "string",  "tool_calls": [    {}  ],  "tool_call_id": "string",  "sent_at": "2024-07-29T15:51:28.071Z",  "metadata": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/message' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "role": "string",  "content": "",  "name": "string",  "tool_choice": "string",  "tool_calls": [    {}  ],  "tool_call_id": "string",  "sent_at": "2024-07-29T15:51:28.071Z",  "metadata": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/message' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "role": "string",  "content": "",  "name": "string",  "tool_choice": "string",  "tool_calls": [    {}  ],  "tool_call_id": "string",  "sent_at": "2024-07-29T15:51:28.071Z",  "metadata": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/message' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "role": "string",  "content": "",  "name": "string",  "tool_choice": "string",  "tool_calls": [    {}  ],  "tool_call_id": "string",  "sent_at": "2024-07-29T15:51:28.071Z",  "metadata": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/message' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "role": "string",  "content": "",  "name": "string",  "tool_choice": "string",  "tool_calls": [    {}  ],  "tool_call_id": "string",  "sent_at": "2024-07-29T15:51:28.071Z",  "metadata": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/message' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "role": "string",  "content": "",  "name": "string",  "tool_choice": "string",  "tool_calls": [    {}  ],  "tool_call_id": "string",  "sent_at": "2024-07-29T15:51:28.071Z",  "metadata": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/message' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "role": "string",  "content": "",  "name": "string",  "tool_choice": "string",  "tool_calls": [    {}  ],  "tool_call_id": "string",  "sent_at": "2024-07-29T15:51:28.071Z",  "metadata": {}}'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/message' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "role": "string",  "content": "",  "name": "string",  "tool_choice": "string",  "tool_calls": [    {}  ],  "tool_call_id": "string",  "sent_at": "2024-07-29T15:51:28.071Z",  "metadata": {}}'
```

## Response samples
```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```
# Get conversation messages

Retrieve messages for a specific conversation, including tool calls made by the assistant.

Get conversation messages API{"@context":"http://schema.org","@type":"TechArticle","headline":"Get conversation messages API","description":"Retrieve messages for a specific conversation, including tool calls made by the assistant.","url":"https://developers.telnyx.com/api/inference/inference-embedding/get-conversations-public-conversation-id-messages-get","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownGet conversation messages
GET https://api.telnyx.com/v2/ai/conversations/:conversation_id/messages
Retrieve messages for a specific conversation, including tool calls made by the assistant.
Request ​
Responses ​200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `conversation_id` (string) [required]

## Response

## Response Schema - data
- `data` (object[]) [required]: Array []
  - `role` (string) [required]: *Possible values:* [`user` , `assistant` , `tool` ]The role of the message sender.
  - `text` (string) [required]: The message content. Can be null for tool calls.
  - `tool_calls` (object[]) [required]: Optional tool calls made by the assistant.Array []
    - `id` (string) [required]: Unique identifier for the tool call.
    - `type` (string) [required]: *Possible values:* [`function` ]Type of the tool call.
    - `function` (object) [required]
      - `name` (string) [required]: Name of the function to call.
      - `arguments` (string) [required]: JSON-formatted arguments to pass to the function.
  - `created_at` (string<date-time>): The datetime the message was created on the conversation. This does not necesarily correspond to the time the message was sent. The best field to use to determine the time the end user experienced the message is sent_at .
  - `sent_at` (string<date-time>): The datetime the message was sent to the end user.
- `meta` (object) [required]
  - `total_pages` (integer) [required]
  - `total_results` (integer) [required]
  - `page_number` (integer) [required]
  - `page_size` (integer) [required]

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/messages' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/messages' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/messages' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/messages' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/messages' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/messages' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/messages' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/messages' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/messages' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/messages' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/messages' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/messages' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/messages' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/ai/conversations/:conversation_id/messages' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "data": [    {      "role": "user",      "text": "string",      "tool_calls": [        {          "id": "string",          "type": "function",          "function": {            "name": "string",            "arguments": "string"          }        }      ],      "created_at": "2025-04-15T13:07:28.764Z",      "sent_at": "2025-04-15T13:07:28.764Z"    }  ],  "meta": {    "total_pages": 0,    "total_results": 0,    "page_number": 0,    "page_size": 0  }}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```
