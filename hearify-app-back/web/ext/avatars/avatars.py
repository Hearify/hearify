import random

from jinja2 import Environment, BaseLoader

# island, circle, shape
COLORS = [
    ('#061E4F', '#E6F9FF', '#76A7FF'),
    ('#5B0000', '#FFE3E3', '#FF7373'),
    ('#CC6111', '#FFF1E6', '#FFAA64'),
    ('#2F3135', '#F2F2F2', '#8C8C8C'),
    ('#BC133C', '#FFC7D4', '#FF4D6F'),
    ('#192866', '#D7DFFF', '#525FA3'),
    ('#53288C', '#EAD7FF', '#AF61F2'),
    ('#007203', '#DEFFDF', '#75C675'),
]

SHAPES = [
    '<path d="M51.7391 41.8373L36.3832 26.4814L21.0273 41.8373" stroke="{{color}}" stroke-width="7.43968" stroke-miterlimit="10"/>',
    '<path d="M28.1113 39.7887C32.6146 44.292 39.9159 44.292 44.4192 39.7887C48.9225 35.2855 48.9225 27.9842 44.4192 23.4809C39.9159 18.9776 32.6146 18.9776 28.1113 23.4809" stroke="{{color}}" stroke-width="7.43968" stroke-miterlimit="10"/>',
    '<path d="M12.0342 38.7524H24.3142C24.3142 33.628 28.4683 29.4739 33.5927 29.4739H41.8907C47.0151 29.4739 51.1692 33.628 51.1692 38.7524H61.8218" stroke="{{color}}" stroke-width="8.96317" stroke-miterlimit="10"/>',
    '<path d="M49.714 24.8314V32.2728C49.714 39.2667 43.9917 44.9889 36.9969 44.9889C36.5598 44.9889 36.1276 44.9665 35.7015 44.9229C27.2175 44.0545 23.1178 33.9455 27.9864 26.9433L35.0885 16.729" stroke="{{color}}" stroke-width="8.96317" stroke-miterlimit="10"/>',
    '<path d="M14.4248 21.2539C14.4248 33.7982 24.5939 43.9673 37.1382 43.9673C49.6824 43.9673 59.8515 33.7981 59.8515 21.2539" stroke="{{color}}" stroke-width="8.96317" stroke-miterlimit="10"/>',
    '<path d="M47.5895 21.4915H25.873V43.2079H47.5895V21.4915Z" stroke="{{color}}" stroke-width="7.43968" stroke-miterlimit="10"/>',
    '<path d="M46.927 31.8134C46.927 25.4448 41.7643 20.282 35.3956 20.282C29.027 20.282 23.8643 25.4448 23.8643 31.8134C23.8643 38.182 29.027 43.3448 35.3956 43.3448" stroke="{{color}}" stroke-width="7.43968" stroke-miterlimit="10"/>',
    '<path d="M48.2174 47.4183V25.7019H26.501" stroke="{{color}}" stroke-width="7.43968" stroke-miterlimit="10"/>',
    '<path d="M50.7746 44.6856L44.8488 29.1267C41.8994 21.8112 31.6043 21.641 28.4146 28.8549L27.3028 31.3694L21.415 44.6856" stroke="{{color}}" stroke-width="8.96317" stroke-miterlimit="10"/>',
    '<path d="M52.3159 34.6831C43.4458 25.813 29.0644 25.813 20.1943 34.6831" stroke="{{color}}" stroke-width="8.96317" stroke-miterlimit="10"/>',
    '<path d="M61.0088 41.6509L47.2485 27.4131C45.8104 25.9252 43.3097 26.467 42.6164 28.4167L39.8214 36.2781C38.9424 38.7503 35.4462 38.7503 34.5671 36.2781L31.7619 28.3884C31.0576 26.4615 28.5749 25.9327 27.1441 27.4131L13.3838 41.6509" stroke="{{color}}" stroke-width="7.43968" stroke-miterlimit="10"/>',
    '<path d="M27.2417 24.0876C22.7384 28.5909 22.7384 35.8922 27.2417 40.3955C31.745 44.8988 39.0463 44.8988 43.5496 40.3955C48.0529 35.8922 48.0529 28.5909 43.5496 24.0876" stroke="{{color}}" stroke-width="7.43968" stroke-miterlimit="10"/>',
    '<path d="M42.2574 41.1766L54.3912 41.3634L48.1085 21.954L37.8759 21.7786H37.2916L27.059 21.954L20.7764 41.3634L32.9101 41.1766H42.2574Z" stroke="{{color}}" stroke-width="7.43968" stroke-miterlimit="10"/>',
    '<path d="M59.9769 37.0132H46.3103L36.4163 24.3083L26.4801 37.0132H12.8135" stroke="{{color}}" stroke-width="7.43968" stroke-miterlimit="10"/>',
    '<path d="M36.0458 19.4015L23.4194 32.0278L36.0458 44.6542L48.6721 32.0278L36.0458 19.4015Z" stroke="{{color}}" stroke-width="7.43968" stroke-miterlimit="10"/>',
    '<path d="M21.3643 26.7498L36.7201 42.1056L52.076 26.7498" stroke="{{color}}" stroke-width="7.43968" stroke-miterlimit="10"/>',
    '<path d="M48.271 45.6601C48.271 33.1159 38.1018 22.9468 25.5576 22.9468" stroke="{{color}}" stroke-width="8.96317" stroke-miterlimit="10"/>',
    '<path d="M12.4868 27.7537H26.1534L36.0475 40.4585L45.9836 27.7537H59.6503" stroke="{{color}}" stroke-width="7.43968" stroke-miterlimit="10"/>',
    '<path d="M12.2446 26.5615L26.005 40.7993C27.443 42.2873 29.9438 41.7454 30.637 39.7957L33.4321 31.9344C34.311 29.4622 37.8073 29.4621 38.6863 31.9344L41.4915 39.824C42.1959 41.7509 44.6786 42.2797 46.1093 40.7993L59.8697 26.5616" stroke="{{color}}" stroke-width="7.43968" stroke-miterlimit="10"/>',
    '<path d="M25.5654 45.6601C25.5654 33.1159 35.7345 22.9468 48.2788 22.9468" stroke="{{color}}" stroke-width="8.96317" stroke-miterlimit="10"/>',
    '<path d="M25.501 43.4009C38.0452 43.4009 48.2143 33.2317 48.2143 20.6875" stroke="{{color}}" stroke-width="8.96317" stroke-miterlimit="10"/>',
    '<path d="M36.3828 19.625V48.5873" stroke="{{color}}" stroke-width="7.43968" stroke-miterlimit="10"/>',
    '<path d="M49.6133 24.2247V31.6661C49.6133 38.66 43.8911 44.3822 36.8962 44.3822C29.9024 44.3822 24.1802 38.66 24.1802 31.6661V24.2247" stroke="{{color}}" stroke-width="8.96317" stroke-miterlimit="10"/>',
    '<path d="M24.4678 30.3253C24.4678 23.4141 30.1224 17.7595 37.0335 17.7595C37.4655 17.7595 37.8925 17.7816 38.3136 17.8247C46.8239 18.6959 50.5736 29.1519 45.1087 35.7336L35.093 47.7959" stroke="{{color}}" stroke-width="8.96317" stroke-miterlimit="10"/>',
    '<path d="M36.9066 43.8192C43.7449 43.8192 49.2884 38.2758 49.2884 31.4375C49.2884 24.5993 43.7449 19.0558 36.9066 19.0558C30.0684 19.0558 24.5249 24.5993 24.5249 31.4375C24.5249 38.2758 30.0684 43.8192 36.9066 43.8192Z" stroke="{{color}}" stroke-width="8.96317" stroke-miterlimit="10"/>',
    '<path d="M46.904 21.4915H25.1875V43.2079" stroke="{{color}}" stroke-width="7.43968" stroke-miterlimit="10"/>',
    '<path d="M24.1724 46.7341V39.2927C24.1724 32.2989 29.8946 26.5767 36.8894 26.5767C43.8832 26.5767 49.6055 32.2989 49.6055 39.2927V46.7341" stroke="{{color}}" stroke-width="8.96317" stroke-miterlimit="10"/>',
    '<path d="M14.0757 43.9673C14.0757 31.423 24.2448 21.2539 36.789 21.2539C49.3333 21.2539 59.5024 31.423 59.5024 43.9673" stroke="{{color}}" stroke-width="8.96317" stroke-miterlimit="10"/>',
    '<path d="M52.665 28.0305C43.7949 36.9006 29.4136 36.9006 20.5435 28.0305" stroke="{{color}}" stroke-width="8.96317" stroke-miterlimit="10"/>',
    '<path d="M51.2011 34.106H22.2388" stroke="{{color}}" stroke-width="7.43968" stroke-miterlimit="10"/>',
    '<path d="M49.4587 47.7959V30.3253C49.4587 23.4141 43.8041 17.7595 36.8929 17.7595C29.9818 17.7595 24.3271 23.4141 24.3271 30.3253" stroke="{{color}}" stroke-width="8.96317" stroke-miterlimit="10"/>',
    '<path d="M26.626 20.1208V41.8373H48.3424" stroke="{{color}}" stroke-width="7.43968" stroke-miterlimit="10"/>',
    '<path d="M48.2866 42.7942C35.7424 42.7942 25.5732 32.625 25.5732 20.0808" stroke="{{color}}" stroke-width="8.96317" stroke-miterlimit="10"/>',
    '<path d="M13.4927 42.7134C26.0369 42.7134 36.206 32.5442 36.206 20C36.206 32.5443 46.3752 42.7134 58.9194 42.7134" stroke="{{color}}" stroke-width="8.96317" stroke-miterlimit="10"/>',
    '<path d="M60.6035 24.8628C48.0592 24.8628 37.8901 35.0319 37.8901 47.5761C37.8901 35.0319 27.721 24.8628 15.1768 24.8628" stroke="{{color}}" stroke-width="8.96317" stroke-miterlimit="10"/>',
]

AVATAR_TMPL = """
<svg width="73" height="73" viewBox="0 0 73 73" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M36.858 72.5392C56.7657 72.5392 72.904 56.4009 72.904 36.4933C72.904 16.5856 56.7657 0.447266 36.858 0.447266C16.9503 0.447266 0.812012 16.5856 0.812012 36.4933C0.812012 56.4009 16.9503 72.5392 36.858 72.5392Z" fill="{{circle_color}}"/>
<path d="M61.291 62.987C54.6432 57.5252 46.1337 54.2463 36.8584 54.2463C27.5822 54.2463 19.0719 57.5258 12.4238 62.9886C12.4238 62.9886 21.1503 72.5394 36.8584 72.5394C52.5665 72.5394 61.291 62.987 61.291 62.987Z" fill="{{island_color}}"/>
{{shape}}
</svg>
"""


def get_random_avatar() -> str:
    """"""

    env = Environment(loader=BaseLoader())

    shape_template = random.choice(SHAPES)
    island_color, circle_color, shape_color = random.choice(COLORS)
    print(island_color, circle_color, shape_color)
    print(shape_template)

    shape = env.from_string(shape_template).render(color=shape_color)
    print("renderd: ", shape)
    avatar_r = env.from_string(AVATAR_TMPL).render(
        shape=shape,
        circle_color=circle_color,
        island_color=island_color,
    )

    return avatar_r
