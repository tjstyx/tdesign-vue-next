import { defineComponent, ref, onMounted, computed, onUnmounted, watch } from 'vue';
import omit from 'lodash/omit';
import { ImageErrorIcon, ImageIcon } from 'tdesign-icons-vue-next';
import observe from '../_common/js/utils/observe';
import { useConfig } from '../config-provider/useConfig';
import { useTNodeDefault, useTNodeJSX } from '../hooks/tnode';
import { TdImageProps } from './type';
import props from './props';
import Space from '../space';

export default defineComponent({
  name: 'TImage',

  props,

  setup(props: TdImageProps) {
    const imageRef = ref<HTMLElement>(null);
    let io: IntersectionObserver = null;

    const renderTNodeJSX = useTNodeJSX();

    onMounted(() => {
      if (!props.lazy || !imageRef.value) return;

      const ioObserver = observe(imageRef.value, null, handleLoadImage, 0);
      io = ioObserver;
    });

    onUnmounted(() => {
      imageRef.value && io && io.unobserve(imageRef.value);
    });

    const { classPrefix, globalConfig } = useConfig('image');

    const imageSrc = ref(props.src);
    watch(
      () => props.src,
      () => {
        hasError.value = false;
        isLoaded.value = false;
        imageSrc.value = props.src;
      },
    );

    const shouldLoad = ref(!props.lazy);
    const handleLoadImage = () => {
      shouldLoad.value = true;
    };

    const isLoaded = ref(false);
    const handleLoad = (e: Event) => {
      isLoaded.value = true;
      props.onLoad?.({ e });
    };

    const hasError = ref(false);
    const handleError = (e: Event) => {
      hasError.value = true;
      props.onError?.({ e });
    };

    const hasMouseEvent = computed(() => {
      return props.overlayTrigger === 'hover';
    });

    const shouldShowOverlay = ref(!hasMouseEvent.value);
    const handleToggleOverlay = () => {
      if (hasMouseEvent.value) {
        shouldShowOverlay.value = !shouldShowOverlay.value;
      }
    };

    const renderPlaceholder = () => {
      const placeholder = renderTNodeJSX('placeholder');
      if (!placeholder) return null;
      return <div class={`${classPrefix.value}-image__placeholder`}>{placeholder}</div>;
    };

    const renderGalleryShadow = () => {
      if (!props.gallery) return null;
      return <div class={`${classPrefix.value}-image__gallery-shadow`} />;
    };

    const renderOverlay = () => {
      const overlayContent = renderTNodDefault('overlayContent');
      if (!overlayContent) return null;
      return (
        <div
          class={[
            `${classPrefix.value}-image__overlay-content`,
            !shouldShowOverlay.value && `${classPrefix.value}-image__overlay-content--hidden`,
          ]}
        >
          {overlayContent}
        </div>
      );
    };

    const renderTNodDefault = useTNodeDefault();

    return () => (
      <div
        ref={imageRef}
        class={[
          `${classPrefix.value}-image__wrapper`,
          `${classPrefix.value}-image__wrapper--shape-${props.shape}`,
          props.gallery && `${classPrefix.value}-image__wrapper--gallery`,
          hasMouseEvent.value && `${classPrefix.value}-image__wrapper--need-hover`,
        ]}
        onMouseenter={handleToggleOverlay}
        onMouseleave={handleToggleOverlay}
        {...omit(props, [
          'src',
          'alt',
          'fit',
          'position',
          'shape',
          'placeholder',
          'loading',
          'error',
          'overlayTrigger',
          'overlayContent',
          'lazy',
          'gallery',
          'onLoad',
          'onError',
        ])}
      >
        {renderPlaceholder()}
        {renderGalleryShadow()}

        {(hasError.value || !shouldLoad.value) && <div class={`${classPrefix.value}-image`} />}
        {!(hasError.value || !shouldLoad.value) && (
          <img
            src={imageSrc.value}
            onError={handleError}
            onLoad={handleLoad}
            class={[
              `${classPrefix.value}-image`,
              `${classPrefix.value}-image--fit-${props.fit}`,
              `${classPrefix.value}-image--position-${props.position}`,
            ]}
            alt={props.alt}
          />
        )}
        {!(hasError.value || !shouldLoad.value) && !isLoaded.value && (
          <div class={`${classPrefix.value}-image__loading`}>
            {renderTNodeJSX('loading') || (
              <Space direction="vertical" size={8} align="center">
                <ImageIcon size="24px" />
                {globalConfig.value.loadingText}
              </Space>
            )}
          </div>
        )}

        {hasError.value && (
          <div class={`${classPrefix.value}-image__error`}>
            {renderTNodDefault('error', {
              defaultNode: (
                <Space direction="vertical" size={8} align="center">
                  <ImageErrorIcon size="24px" />
                  {globalConfig.value.errorText}
                </Space>
              ),
            })}
          </div>
        )}

        {renderOverlay()}
      </div>
    );
  },
});
