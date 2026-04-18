package com.iflytek.skillhub.auth.entity;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.persistence.Column;
import java.lang.reflect.Field;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.junit.jupiter.api.Test;

class IdentityBindingEntityMappingTest {

    @Test
    void test_extraJson_whenMappedToJsonb_usesHibernateJsonJdbcType() throws Exception {
        Field extraJsonField = IdentityBinding.class.getDeclaredField("extraJson");

        Column column = extraJsonField.getAnnotation(Column.class);
        JdbcTypeCode jdbcTypeCode = extraJsonField.getAnnotation(JdbcTypeCode.class);

        assertThat(column).isNotNull();
        assertThat(column.columnDefinition()).isEqualTo("jsonb");
        assertThat(jdbcTypeCode).isNotNull();
        assertThat(jdbcTypeCode.value()).isEqualTo(SqlTypes.JSON);
    }
}
