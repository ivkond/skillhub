package com.iflytek.skillhub.exception;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.iflytek.skillhub.dto.ApiResponse;
import com.iflytek.skillhub.dto.ApiResponseFactory;
import com.iflytek.skillhub.metrics.SkillHubMetrics;
import com.iflytek.skillhub.security.SensitiveLogSanitizer;
import jakarta.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.context.support.StaticMessageSource;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.method.MethodValidationResult;
import org.springframework.validation.method.ParameterValidationResult;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.context.request.async.AsyncRequestTimeoutException;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @Mock
    private SensitiveLogSanitizer sensitiveLogSanitizer;

    @Mock
    private SkillHubMetrics metrics;

    @Mock
    private HttpServletRequest request;

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        StaticMessageSource messageSource = new StaticMessageSource();
        messageSource.addMessage("error.request.timeout", java.util.Locale.getDefault(), "Request timed out");
        ApiResponseFactory responseFactory = new ApiResponseFactory(
                messageSource,
                Clock.fixed(Instant.parse("2026-03-20T00:00:00Z"), ZoneOffset.UTC)
        );
        handler = new GlobalExceptionHandler(responseFactory, sensitiveLogSanitizer, metrics);
    }

    @Test
    void handleAsyncRequestTimeout_shouldReturnNoContentForSseRequests() {
        when(request.getRequestURI()).thenReturn("/api/v1/notifications/sse");

        ResponseEntity<?> response = handler.handleAsyncRequestTimeout(new AsyncRequestTimeoutException(), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(response.getBody()).isNull();
    }

    @Test
    void handleAsyncRequestTimeout_shouldReturnApiEnvelopeForNonSseRequests() {
        when(request.getRequestURI()).thenReturn("/api/v1/publish");
        when(request.getMethod()).thenReturn("POST");
        when(sensitiveLogSanitizer.sanitizeRequestTarget(request)).thenReturn("/api/v1/publish");

        ResponseEntity<?> response = handler.handleAsyncRequestTimeout(new AsyncRequestTimeoutException(), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.REQUEST_TIMEOUT);
        assertThat(response.getBody()).isInstanceOf(ApiResponse.class);
        ApiResponse<?> body = (ApiResponse<?>) response.getBody();
        assertThat(body.code()).isEqualTo(408);
        assertThat(body.msg()).isEqualTo("Request timed out");
    }

    @Test
    void handleHandlerMethodValidation_shouldReturnBadRequestWithResolvedMessage() throws Exception {
        when(request.getMethod()).thenReturn("POST");
        when(sensitiveLogSanitizer.sanitizeRequestTarget(request)).thenReturn("/api/v1/namespaces/team-a/members/batch");

        Method method = GlobalExceptionHandlerTest.class.getDeclaredMethod("sampleBatchValidationTarget", List.class);
        MethodParameter methodParameter = new MethodParameter(method, 0);
        ParameterValidationResult validationResult = new ParameterValidationResult(
                methodParameter,
                List.of(),
                List.of(new DefaultMessageSourceResolvable(
                        new String[]{"validation.batch.members.notEmpty"},
                        "Members list cannot be empty"))
        );
        MethodValidationResult methodValidationResult = MethodValidationResult.create(
                this,
                method,
                List.of(validationResult)
        );

        ResponseEntity<ApiResponse<Void>> response = handler.handleHandlerMethodValidation(
                new HandlerMethodValidationException(methodValidationResult),
                request
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().code()).isEqualTo(400);
        assertThat(response.getBody().msg()).isEqualTo("Members list cannot be empty");
    }

    @SuppressWarnings("unused")
    private void sampleBatchValidationTarget(List<String> members) {
    }
}
