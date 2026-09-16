package ci.volta.backend.model.converters;

import ci.volta.backend.model.ChecklistItem;
import ci.volta.backend.model.DocumentInfo;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class JsonConverters {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private JsonConverters() {
    }

    private abstract static class JsonListConverter<T> implements AttributeConverter<List<T>, String> {
        private final TypeReference<List<T>> typeRef;

        JsonListConverter(TypeReference<List<T>> typeRef) {
            this.typeRef = typeRef;
        }

        @Override
        public String convertToDatabaseColumn(List<T> attribute) {
            try {
                return MAPPER.writeValueAsString(attribute == null ? List.of() : attribute);
            } catch (Exception e) {
                throw new IllegalStateException("Failed to serialize list", e);
            }
        }

        @Override
        public List<T> convertToEntityAttribute(String dbData) {
            if (dbData == null || dbData.isBlank()) {
                return new ArrayList<>();
            }
            try {
                String cleaned = dbData
                    .replaceAll("(?s)/\\*.*?\\*/", "")
                    .replaceAll("//[^\\n]*", "")
                    .trim();
                if (cleaned.isEmpty() || cleaned.equals("[]")) {
                    return new ArrayList<>();
                }
                return MAPPER.readValue(cleaned, typeRef);
            } catch (Exception e) {
                return new ArrayList<>();
            }
        }
    }

    @Converter
    public static class StringListConverter extends JsonListConverter<String> {
        public StringListConverter() {
            super(new TypeReference<>() {
            });
        }
    }

    @Converter
    public static class ChecklistConverter extends JsonListConverter<ChecklistItem> {
        public ChecklistConverter() {
            super(new TypeReference<>() {
            });
        }
    }

    @Converter
    public static class DocumentListConverter extends JsonListConverter<DocumentInfo> {
        public DocumentListConverter() {
            super(new TypeReference<>() {
            });
        }
    }

    /** Réponses libres d'un formulaire de demande : un texte par champ, rien d'imbriqué. */
    @Converter
    public static class StringMapConverter implements AttributeConverter<Map<String, String>, String> {
        @Override
        public String convertToDatabaseColumn(Map<String, String> attribute) {
            try {
                return MAPPER.writeValueAsString(attribute == null ? Map.of() : attribute);
            } catch (Exception e) {
                throw new IllegalStateException("Failed to serialize map", e);
            }
        }

        @Override
        public Map<String, String> convertToEntityAttribute(String dbData) {
            if (dbData == null || dbData.isBlank()) {
                return new LinkedHashMap<>();
            }
            try {
                return MAPPER.readValue(dbData, new TypeReference<Map<String, String>>() {
                });
            } catch (Exception e) {
                return new LinkedHashMap<>();
            }
        }
    }
}
