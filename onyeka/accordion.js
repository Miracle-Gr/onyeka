const accordions = $('.accord-item');

accordions.click((e) => {
    let target = $(e.currentTarget);
    let paragraph = target.find('.accord-paragraph');
    let arrow = target.find('.accord-ico');

    arrow.toggleClass('active');
    paragraph.slideToggle('fast');
})